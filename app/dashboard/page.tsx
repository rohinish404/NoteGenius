// app/dashboard/page.tsx
"use client";

import React, { useState, useEffect, useCallback, useRef, Suspense, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { logOutAction } from "@/actions/users";
import { summarizeNoteAction } from "@/actions/notes";
import { fetchNotes, createNote, updateNote, deleteNote, NoteData } from "@/lib/notes";

// Import the new components
import { NoteSidebar } from "@/components/NoteSidebar";
import { NoteEditor } from "@/components/NoteEditor";
import { SummaryDialog } from "@/components/SummaryDialog";
import { Loader2 } from "lucide-react";


export const dynamic = 'force-dynamic';

// --- Fallback Component ---
function DashboardFallback() {
  return (
    <div className="flex h-screen w-full items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  );
}

// --- Main Page Component ---
export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardFallback />}>
      <AppNotesPage />
    </Suspense>
  );
}

// --- AppNotesPage Container Component ---
function AppNotesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  const noteIdFromUrl = searchParams.get("noteId");

  // == State Management ==
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(noteIdFromUrl);
  const [currentContent, setCurrentContent] = useState<string>("");
  const [currentTitle, setCurrentTitle] = useState<string>("");
  const contentChangedRef = useRef(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [showSummaryDialog, setShowSummaryDialog] = useState(false);
  const isNavigatingRef = useRef(false);

  // == React Query Hooks ==
  const {
    data: notesData,
    isLoading: isLoadingNotes,
    isError: isErrorNotes,
    error: errorNotes,
    isFetching: isFetchingNotes,
  } = useQuery<NoteData[]>({
    queryKey: ['notes'],
    queryFn: fetchNotes,
  });

  const notes = useMemo(() => {
    if (!notesData) return [];
    return notesData
      .map(note => ({
        ...note,
        lastModified: new Date(note.updatedAt).getTime(),
      }))
      .sort((a, b) => b.lastModified - a.lastModified);
  }, [notesData]);

  const selectedNote = useMemo(() => {
     return notes.find((note) => note.id === selectedNoteId) || null;
  }, [notes, selectedNoteId]);

  // Effects for URL sync and editor content update (remain the same as before)
  useEffect(() => {
    if (isLoadingNotes || isNavigatingRef.current) return;

    let targetNoteId = noteIdFromUrl;

    if (!targetNoteId && notes.length > 0) {
      targetNoteId = notes[0].id;
    }

    if (targetNoteId && !notes.find(n => n.id === targetNoteId) && notes.length > 0) {
         targetNoteId = notes[0].id;
    }

    if (targetNoteId && targetNoteId !== noteIdFromUrl) {
      isNavigatingRef.current = true;
      router.replace(`/dashboard?noteId=${targetNoteId}`, { scroll: false });
      setSelectedNoteId(targetNoteId);
      setTimeout(() => { isNavigatingRef.current = false; }, 100);
    } else if (targetNoteId && targetNoteId === noteIdFromUrl) {
        setSelectedNoteId(targetNoteId);
    } else if (!targetNoteId && notes.length === 0 && !isLoadingNotes && !isFetchingNotes) {
        setSelectedNoteId(null);
    }
  }, [noteIdFromUrl, notes, isLoadingNotes, isFetchingNotes, router]);

  useEffect(() => {
    if (selectedNote) {
      if (!contentChangedRef.current) {
          setCurrentContent(selectedNote.content);
          setCurrentTitle(selectedNote.title);
      }
    } else if (!isLoadingNotes && notes.length === 0) {
        setCurrentContent("");
        setCurrentTitle("");
        contentChangedRef.current = false;
    }
  }, [selectedNote, isLoadingNotes, notes.length]);


  // Mutations (remain the same definitions as before)
  const createNoteMutation = useMutation({ /* ... definition ... */
    mutationFn: () => createNote({ title: 'New Note', content: '' }),
    onSuccess: (newNoteData) => {
      toast.success("New note created!");
      queryClient.invalidateQueries({ queryKey: ['notes'] });
       isNavigatingRef.current = true;
       router.push(`/dashboard?noteId=${newNoteData.id}`, { scroll: false });
       setSelectedNoteId(newNoteData.id);
       setTimeout(() => { isNavigatingRef.current = false; }, 100);
       contentChangedRef.current = false;
    },
    onError: (error) => { toast.error("Error creating note", { description: error.message }); },
  });

  const updateNoteMutation = useMutation({ /* ... definition ... */
     mutationFn: (variables: { id: string; title: string; content: string }) => updateNote(variables),
     onSuccess: (updatedNoteData) => {
        toast.success("Note saved!");
        queryClient.setQueryData(['notes'], (oldData: NoteData[] | undefined) => {
            return oldData
                ? oldData.map(note =>
                    note.id === updatedNoteData.id ? { ...note, ...updatedNoteData, lastModified: new Date(updatedNoteData.updatedAt).getTime() } : note
                ).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
                : [];
        });
        contentChangedRef.current = false;
    },
     onError: (error) => { toast.error("Error saving note", { description: error.message }); },
  });

  const deleteNoteMutation = useMutation({ /* ... definition ... */
    mutationFn: deleteNote,
    onSuccess: (data, noteIdToDelete) => {
      toast.success("Note deleted!");
      queryClient.invalidateQueries({ queryKey: ['notes'] });

      const currentNotes = queryClient.getQueryData<NoteData[]>(['notes']) || [];
      const noteToDeleteIndex = currentNotes.findIndex(n => n.id === noteIdToDelete);
      let nextSelectedId: string | null = null;

      if (selectedNoteId === noteIdToDelete) {
        const remainingNotes = currentNotes.filter(n => n.id !== noteIdToDelete);
        if (remainingNotes.length > 0) {
             const nextIndex = noteToDeleteIndex;
             const prevIndex = noteToDeleteIndex - 1;
             if (nextIndex < currentNotes.length -1 && currentNotes[nextIndex+1]?.id !== noteIdToDelete) {
                 nextSelectedId = currentNotes[nextIndex + 1]?.id ?? null;
             } else if (prevIndex >= 0 && currentNotes[prevIndex]?.id !== noteIdToDelete) {
                 nextSelectedId = currentNotes[prevIndex]?.id ?? null;
             }
             if (!nextSelectedId) nextSelectedId = remainingNotes[0]?.id ?? null;
        }

        isNavigatingRef.current = true;
        if (nextSelectedId) {
          router.replace(`/dashboard?noteId=${nextSelectedId}`, { scroll: false });
          setSelectedNoteId(nextSelectedId);
        } else {
          router.replace(`/dashboard`, { scroll: false });
          setSelectedNoteId(null);
          setCurrentContent("");
          setCurrentTitle("");
        }
        setTimeout(() => { isNavigatingRef.current = false; }, 100);
      }
    },
    onError: (error) => { toast.error("Error deleting note", { description: error.message }); },
  });

  const summarizeMutation = useMutation({ /* ... definition ... */
     mutationFn: (noteId: string) => summarizeNoteAction(noteId),
     onMutate: () => { toast.info("Generating summary..."); setSummary(null); setShowSummaryDialog(true); }, // Show dialog immediately
     onSuccess: (result) => {
       if (result.errorMessage) {
         toast.error("Summarization failed", { description: result.errorMessage });
         setSummary("Error: " + result.errorMessage); // Show error in dialog
       } else if (result.summary) {
         setSummary(result.summary);
         toast.success("Summary generated!");
       } else {
         toast.error("Summarization failed", { description: "An unknown error occurred." });
         setSummary("Error: An unknown error occurred.");
       }
     },
     onError: (error) => {
        toast.error("Summarization error", { description: error.message });
        setSummary("Error: " + error.message);
     },
  });

  const logoutMutation = useMutation({ /* ... definition ... */
    mutationFn: logOutAction,
    onSuccess: () => {
      toast.success("Logged out successfully!");
      queryClient.clear();
      router.replace('/');
    },
    onError: (error) => { toast.error("Logout failed", { description: error.message }); },
  });

  // == Event Handlers (Callbacks for Child Components) ==
  const handleSaveNote = useCallback(() => {
    if (!selectedNoteId || !contentChangedRef.current || updateNoteMutation.isPending) return;
    const originalNote = notes.find(n => n.id === selectedNoteId);
    if (!originalNote || (originalNote.content === currentContent && originalNote.title === currentTitle)) {
        contentChangedRef.current = false;
        return;
    }
    updateNoteMutation.mutate({ id: selectedNoteId, title: currentTitle, content: currentContent });
  }, [selectedNoteId, currentContent, currentTitle, notes, updateNoteMutation]);

  const handleBlur = () => {
    if (contentChangedRef.current) {
      handleSaveNote();
    }
  };

  const handleNoteSelect = useCallback((noteId: string) => {
    if (noteId === selectedNoteId || isNavigatingRef.current) return;
    if (selectedNoteId && contentChangedRef.current) {
      handleSaveNote();
    }
    isNavigatingRef.current = true;
    router.push(`/dashboard?noteId=${noteId}`, { scroll: false });
    setSelectedNoteId(noteId);
    contentChangedRef.current = false;
    setTimeout(() => { isNavigatingRef.current = false; }, 100);
  }, [selectedNoteId, handleSaveNote, router]);

  const handleContentChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCurrentContent(event.target.value);
    if (!contentChangedRef.current) contentChangedRef.current = true;
  };

  const handleTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentTitle(event.target.value);
    if (!contentChangedRef.current) contentChangedRef.current = true;
  };

  const handleAddNewNote = useCallback(() => {
    if (selectedNoteId && contentChangedRef.current && !updateNoteMutation.isPending) {
       updateNoteMutation.mutate({ id: selectedNoteId, title: currentTitle, content: currentContent });
    }
    createNoteMutation.mutate();
  }, [createNoteMutation, selectedNoteId, currentTitle, currentContent, updateNoteMutation]);

  const handleDeleteNote = useCallback((noteIdToDelete: string) => {
    if (!noteIdToDelete || deleteNoteMutation.isPending) return;
    deleteNoteMutation.mutate(noteIdToDelete);
  }, [deleteNoteMutation]);

  const handleSummarizeNote = useCallback(() => {
    if (!selectedNoteId || summarizeMutation.isPending || !currentContent?.trim()) return;
    summarizeMutation.mutate(selectedNoteId);
  }, [selectedNoteId, currentContent, summarizeMutation]);

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  // == Render Logic ==
  const anyMutationPending = createNoteMutation.isPending || updateNoteMutation.isPending || deleteNoteMutation.isPending || summarizeMutation.isPending || logoutMutation.isPending;
  const editorLoadingState = isLoadingNotes && !selectedNote; // Loading state specific to editor view

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      {/* Pass necessary state and handlers to Sidebar */}
      <NoteSidebar
        notes={notes}
        selectedNoteId={selectedNoteId}
        isLoadingNotes={isLoadingNotes || isFetchingNotes} // Pass combined loading
        isErrorNotes={isErrorNotes}
        errorNotes={errorNotes as Error | null}
        isCreatingNote={createNoteMutation.isPending}
        isDeletingNote={deleteNoteMutation.isPending}
        deletingNoteId={deleteNoteMutation.variables ?? null} // Pass the ID being deleted
        isLoggingOut={logoutMutation.isPending}
        anyMutationPending={anyMutationPending}
        isNavigating={isNavigatingRef.current}
        onSelectNote={handleNoteSelect}
        onDeleteNote={handleDeleteNote}
        onCreateNote={handleAddNewNote}
        onLogout={handleLogout}
      />

      {/* Pass necessary state and handlers to Editor */}
      <NoteEditor
        note={selectedNote}
        isLoadingNote={editorLoadingState}
        isSaving={updateNoteMutation.isPending}
        isSummarizing={summarizeMutation.isPending}
        anyMutationPending={anyMutationPending}
        title={currentTitle}
        content={currentContent}
        hasChanges={contentChangedRef.current}
        onTitleChange={handleTitleChange}
        onContentChange={handleContentChange}
        onSave={handleSaveNote}
        onSummarize={handleSummarizeNote}
        onBlur={handleBlur}
        errorMessage={isErrorNotes ? (errorNotes as Error)?.message : null} // Pass error relevant to editor display
      />

      {/* Pass necessary state and handlers to Dialog */}
      <SummaryDialog
        isOpen={showSummaryDialog}
        onOpenChange={setShowSummaryDialog}
        noteTitle={selectedNote?.title}
        summary={summary}
        isLoading={summarizeMutation.isPending}
      />
    </div>
  );
}