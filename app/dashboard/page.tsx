"use client";

import React, { useState, useEffect, useCallback, useRef, useTransition, Suspense }
from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
    PlusCircle,
    FileText,
    Trash2,
    Save,
    Loader2,
    LogOut,
    BrainCircuit,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { logOutAction } from "@/actions/users";
import { summarizeNoteAction } from "@/actions/notes"; 
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose, 
} from "@/components/ui/dialog"; 

export const dynamic = 'force-dynamic';

function DashboardFallback() {
  return (
    <div className="flex h-screen w-full items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardFallback />}>
      <AppNotesPage />
    </Suspense>
  );
}

type Note = {
    id: string;
    title: string;
    content: string;
    updatedAt: string;
    lastModified: number;
    createdAt?: string;
    authorId?: string;
};

function AppNotesPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const initialNoteId = searchParams.get("noteId");

    const [notes, setNotes] = useState<Note[]>([]);
    const [selectedNoteId, setSelectedNoteId] = useState<string | null>(initialNoteId);
    const [currentContent, setCurrentContent] = useState<string>("");
    const [currentTitle, setCurrentTitle] = useState<string>("");
    const [isLoading, setIsLoading] = useState(true);
    const [isInitializing, setIsInitializing] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const contentChangedRef = useRef(false);

    const [isLoggingOut, startLogoutTransition] = useTransition();
    const [isSummarizing, startSummarizeTransition] = useTransition();
    const [summary, setSummary] = useState<string | null>(null);
    const [showSummaryDialog, setShowSummaryDialog] = useState(false);

    const selectedNote = notes.find((note) => note.id === selectedNoteId);

    const createNewNote = useCallback(async (): Promise<Note | null> => {
         console.log("Creating new note via API...");
         try {
             const response = await fetch('/api/notes', {
                 method: 'POST',
                 headers: { 'Content-Type': 'application/json' },
                 body: JSON.stringify({ title: 'New Note', content: '' }),
             });
             if (!response.ok) throw new Error('Failed to create note');
             const newNoteData: Omit<Note, 'lastModified'> = await response.json();
             const newNoteWithTimestamp = {
                 ...newNoteData,
                 lastModified: new Date(newNoteData.updatedAt).getTime(),
             };
             toast.success("New note created!");
             return newNoteWithTimestamp;
         } catch (err) {
             console.error("Failed to create new note:", err);
             toast.error("Error creating note", { description: err instanceof Error ? err.message : undefined });
             return null;
         }
     }, []);

     const initializeNotes = useCallback(async () => {
        setIsLoading(true);
        setIsInitializing(true);
        setError(null);
        console.log("Initializing notes...");

        try {
          const response = await fetch("/api/notes");
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
          }
          const fetchedNotes: Omit<Note, 'lastModified'>[] = await response.json();

          const mappedNotes = fetchedNotes
            .map((note) => ({
              ...note,
              lastModified: new Date(note.updatedAt).getTime(),
            }))
            .sort((a, b) => b.lastModified - a.lastModified);

          setNotes(mappedNotes);
          console.log(`Fetched ${mappedNotes.length} notes.`);

          let targetNoteId = selectedNoteId;

          if (!targetNoteId) {
              if (mappedNotes.length > 0) {
                  targetNoteId = mappedNotes[0].id;
              } else {
                  const newNote = await createNewNote();
                  if (newNote) {
                      targetNoteId = newNote.id;
                      setNotes([newNote]);
                  } else {
                       setError("Could not create an initial note.");
                       setIsLoading(false);
                       setIsInitializing(false);
                       return;
                  }
              }
              if (targetNoteId) {
                  router.replace(`/dashboard?noteId=${targetNoteId}`, { scroll: false });
                  setSelectedNoteId(targetNoteId);
              }
          } else {
               if (!mappedNotes.find(n => n.id === targetNoteId)) {
                   targetNoteId = mappedNotes.length > 0 ? mappedNotes[0].id : null;
                   if (targetNoteId) {
                      router.replace(`/dashboard?noteId=${targetNoteId}`, { scroll: false });
                      setSelectedNoteId(targetNoteId);
                   } else {
                       const newNote = await createNewNote();
                       if (newNote) {
                           targetNoteId = newNote.id;
                           setNotes([newNote]);
                           router.replace(`/dashboard?noteId=${targetNoteId}`, { scroll: false });
                           setSelectedNoteId(targetNoteId);
                       } else {
                           setError("Could not create an initial note.");
                       }
                   }
               } else {
                    setSelectedNoteId(targetNoteId);
               }
          }

        } catch (err) {
          console.error("Failed to fetch notes:", err);
          setError(err instanceof Error ? err.message : "An unknown error occurred while fetching notes.");
          toast.error("Error loading notes", { description: err instanceof Error ? err.message : undefined });
        } finally {
          setIsLoading(false);
          setIsInitializing(false);
           console.log("Initialization complete.");
        }
      }, [router, selectedNoteId, createNewNote]);

      useEffect(() => {
        initializeNotes();
      }, [initializeNotes]);

    useEffect(() => {
        if (!isInitializing && selectedNote) {
            console.log(`Updating editor for note: ${selectedNote.id}`);
            setCurrentContent(selectedNote.content);
            setCurrentTitle(selectedNote.title);
            contentChangedRef.current = false;
        } else if (!isInitializing && !selectedNote) {
            setCurrentContent("");
            setCurrentTitle("");
        }
    }, [selectedNoteId, selectedNote, isInitializing]);

    const handleSaveNote = useCallback(async (noteId: string | null, content: string, title: string) => {
        if (!noteId || !contentChangedRef.current || isSaving) {
            return;
        }
        const originalNote = notes.find(n => n.id === noteId);
        if (!originalNote || (originalNote.content === content && originalNote.title === title)) {
            contentChangedRef.current = false;
            return;
        }

        setIsSaving(true);
        setError(null);
        try {
            const response = await fetch(`/api/notes/${noteId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, content }),
            });
            if (!response.ok) throw new Error((await response.json()).error || 'Failed to save');
            const updatedNote: Omit<Note, 'lastModified'> = await response.json();
            const noteWithTimestamp = { ...updatedNote, lastModified: new Date(updatedNote.updatedAt).getTime() };
            setNotes(prev => prev.map(n => (n.id === noteId ? noteWithTimestamp : n)).sort((a, b) => b.lastModified - a.lastModified));
            contentChangedRef.current = false;
            toast.success("Note saved!");
        } catch (err) {
            console.error("Failed to save note:", err);
            setError(err instanceof Error ? err.message : "Save failed.");
            toast.error("Error saving note", { description: err instanceof Error ? err.message : undefined });
        } finally {
            setIsSaving(false);
        }
    }, [notes, isSaving]);

    const handleNoteSelect = useCallback((noteId: string) => {
        if (noteId === selectedNoteId) return;

        if (selectedNoteId && contentChangedRef.current) {
          handleSaveNote(selectedNoteId, currentContent, currentTitle);
        }
        router.push(`/dashboard?noteId=${noteId}`, { scroll: false });
        setSelectedNoteId(noteId);
    }, [selectedNoteId, currentContent, currentTitle, handleSaveNote, router]);

     const handleContentChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        setCurrentContent(event.target.value);
        contentChangedRef.current = true;
      };
     const handleTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setCurrentTitle(event.target.value);
        contentChangedRef.current = true;
      };

      const handleAddNewNote = useCallback(async () => {
        if (selectedNoteId && contentChangedRef.current) {
            await handleSaveNote(selectedNoteId, currentContent, currentTitle);
        }
        setIsSaving(true);
        const newNote = await createNewNote();
        setIsSaving(false);
        if (newNote) {
            setNotes(prev => [newNote, ...prev].sort((a, b) => b.lastModified - a.lastModified));
            router.push(`/dashboard?noteId=${newNote.id}`, { scroll: false });
            setSelectedNoteId(newNote.id);
            contentChangedRef.current = false;
        }
    }, [selectedNoteId, currentContent, currentTitle, handleSaveNote, createNewNote, router]);

     const handleDeleteNote = useCallback(async (noteIdToDelete: string) => {
        if (!noteIdToDelete || isSaving) return;
        const originalNotes = [...notes];
        const originalSelectedId = selectedNoteId;
        const noteToDeleteIndex = notes.findIndex(n => n.id === noteIdToDelete);
        if (noteToDeleteIndex === -1) return;
        setNotes(prev => prev.filter(n => n.id !== noteIdToDelete));
        let nextSelectedId: string | null = null;
        if (selectedNoteId === noteIdToDelete) {
            if (notes.length > 1) {
                nextSelectedId = notes[noteToDeleteIndex + 1]?.id || notes[noteToDeleteIndex - 1]?.id || null;
            }
            if (nextSelectedId) {
                 router.replace(`/dashboard?noteId=${nextSelectedId}`, { scroll: false });
            } else {
                 router.replace(`/dashboard`, { scroll: false });
            }
            setSelectedNoteId(nextSelectedId);
            if (!nextSelectedId) {
                setCurrentContent("");
                setCurrentTitle("");
            }
        }
        setError(null);
        try {
            const response = await fetch(`/api/notes/${noteIdToDelete}`, { method: 'DELETE' });
            if (!response.ok) throw new Error((await response.json()).error || 'Failed to delete');
            toast.success("Note deleted!");
        } catch (err) {
            console.error("Failed to delete note:", err);
            setError(err instanceof Error ? err.message : "Delete failed.");
            toast.error("Error deleting note", { description: err instanceof Error ? err.message : undefined });
            setNotes(originalNotes);
            setSelectedNoteId(originalSelectedId);
             if (originalSelectedId) {
                 router.replace(`/dashboard?noteId=${originalSelectedId}`, { scroll: false });
             } else {
                 router.replace(`/dashboard`, { scroll: false });
             }
        }
    }, [notes, selectedNoteId, isSaving, router]);

    const handleLogout = async () => {
        startLogoutTransition(async () => {
            const result = await logOutAction();
            if (result?.errorMessage) {
                toast.error("Logout failed", { description: result.errorMessage });
            } else {
                toast.success("Logged out successfully!");
                router.replace('/');
            }
        });
    };

    const handleSummarizeNote = useCallback(() => {
        if (!selectedNoteId || isSummarizing) return;

        startSummarizeTransition(async () => {
            setSummary(null);
            setShowSummaryDialog(false);

            toast.info("Generating summary...");
            const result = await summarizeNoteAction(selectedNoteId);

            if (result.errorMessage) {
                toast.error("Summarization failed", { description: result.errorMessage });
            } else if (result.summary) {
                setSummary(result.summary);
                setShowSummaryDialog(true);
                toast.success("Summary generated!");
            } else {
                 toast.error("Summarization failed", { description: "An unknown error occurred." });
            }
        });
    }, [selectedNoteId, isSummarizing]);

    return (
        <div className="flex h-screen bg-background text-foreground overflow-hidden">
            <aside className="w-64 md:w-72 border-r border-border flex flex-col bg-muted/30 dark:bg-muted/10">
                <div className="p-4 border-b border-border flex justify-between items-center">
                    <h2 className="text-lg font-semibold">My Notes</h2>
                    <Button variant="ghost" size="icon" onClick={handleAddNewNote} title="Add New Note" disabled={isSaving || isInitializing || isLoggingOut || isSummarizing}>
                        {(isSaving && !isInitializing) ? <Loader2 className="h-5 w-5 animate-spin" /> : <PlusCircle className="h-5 w-5" />}
                    </Button>
                </div>
                <nav className="flex-1 overflow-y-auto p-2 space-y-1">
                   {isLoading ? (
                        <div className="space-y-2 p-2">
                        <Skeleton className="h-8 w-full" />
                        <Skeleton className="h-8 w-full" />
                        <Skeleton className="h-8 w-5/6" />
                        </div>
                    ) : error && notes.length === 0 ? (
                        <p className="text-sm text-destructive text-center p-4">{error}</p>
                    ) : notes.length > 0 ? (
                        notes.map((note) => (
                        <div key={note.id} className="group relative flex items-center">
                            <button
                                onClick={() => handleNoteSelect(note.id)}
                                disabled={isInitializing || isLoggingOut || isSummarizing}
                                className={cn(
                                    "flex-1 flex items-center gap-3 text-left px-3 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 disabled:cursor-not-allowed",
                                    selectedNoteId === note.id
                                    ? "bg-primary/10 text-primary dark:bg-primary/20"
                                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground dark:hover:bg-muted/50"
                                )}
                                >
                                <FileText className="h-4 w-4 flex-shrink-0" />
                                <span className="truncate flex-1">{note.title}</span>
                            </button>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="absolute right-1 h-7 w-7 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity text-muted-foreground hover:text-destructive disabled:opacity-0"
                                onClick={(e) => { e.stopPropagation(); handleDeleteNote(note.id); }}
                                disabled={isSaving || isInitializing || isLoggingOut || isSummarizing}
                                title={`Delete "${note.title}"`}
                                >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                        ))
                    ) : (
                        <p className="text-sm text-muted-foreground text-center p-4">No notes yet. Create one!</p>
                    )}
                </nav>
                <div className="p-4 border-t border-border text-xs text-muted-foreground space-y-2">
                    <div>{isLoading ? "Loading..." : `${notes.length} notes`}</div>
                    <Button
                        variant="outline"
                        size="sm"
                        className="w-full justify-start"
                        onClick={handleLogout}
                        disabled={isLoggingOut || isSummarizing}
                    >
                        {isLoggingOut ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <LogOut className="mr-2 h-4 w-4" />
                        )}
                        Logout
                    </Button>
                </div>
            </aside>

            <main className="flex-1 flex flex-col overflow-hidden">
                 {isInitializing ? (
                    <div className="flex-1 flex items-center justify-center">
                        <Loader2 className="h-6 w-6 animate-spin mr-2" />
                        <p className="text-muted-foreground">Loading your notes...</p>
                    </div>
                    ) : selectedNote ? (
                    <>
                        <div className="p-4 border-b border-border flex items-center justify-between gap-4 flex-wrap">
                        <input
                            type="text"
                            value={currentTitle}
                            onChange={handleTitleChange}
                            onBlur={() => handleSaveNote(selectedNoteId, currentContent, currentTitle)}
                            placeholder="Note title"
                            className="text-xl font-semibold truncate flex-1 bg-transparent border-none focus:outline-none focus:ring-0 min-w-[100px]"
                            aria-label="Note title"
                            disabled={isSaving || isLoggingOut || isSummarizing}
                        />
                        <div className="flex items-center gap-2 flex-shrink-0">
                            {isSaving && <Loader2 className="h-4 w-4 animate-spin mr-1" aria-label="Saving..." />}
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleSummarizeNote}
                                disabled={!selectedNoteId || isSummarizing || isSaving || isLoggingOut || !currentContent?.trim()} // Disable conditions
                                title={!currentContent?.trim() ? "Cannot summarize empty note" : "Summarize Note with AI"}
                            >
                                {isSummarizing ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <BrainCircuit className="h-4 w-4 mr-1" />}
                                Summarize
                            </Button>
                            {contentChangedRef.current && !isSaving && (
                                <Button variant="ghost" size="sm" onClick={() => handleSaveNote(selectedNoteId, currentContent, currentTitle)} title="Save changes" disabled={isLoggingOut || isSummarizing}>
                                    <Save className="h-4 w-4 mr-1" /> Save
                                </Button>
                            )}
                            <p className="text-xs text-muted-foreground whitespace-nowrap">
                            Last modified: {new Date(selectedNote.lastModified).toLocaleString()}
                            </p>
                        </div>
                        </div>
                        <div className="flex-1 p-4 md:p-6 overflow-y-auto">
                        <Textarea
                            placeholder="Start writing your note..."
                            className="w-full h-full resize-none border-none focus-visible:ring-0 focus:outline-none text-base min-h-[300px] bg-transparent p-0"
                            value={currentContent}
                            onChange={handleContentChange}
                            onBlur={() => handleSaveNote(selectedNoteId, currentContent, currentTitle)}
                            aria-label="Note content"
                            disabled={isSaving || isLoggingOut || isSummarizing}
                        />
                        </div>
                        <div className="p-3 border-t border-border text-sm text-muted-foreground text-right">
                        Character count: {currentContent.length}
                        </div>
                    </>
                    ) : (
                    <div className="flex-1 flex items-center justify-center">
                        <p className="text-muted-foreground">
                        {error ? error : "Select a note or create a new one."}
                        </p>
                    </div>
                    )}
            </main>

             <Dialog open={showSummaryDialog} onOpenChange={setShowSummaryDialog}>
                <DialogContent className="sm:max-w-[525px]">
                    <DialogHeader>
                    <DialogTitle>AI Summary</DialogTitle>
                    <DialogDescription>
                        Here's a summary of your note "{selectedNote?.title || 'current note'}":
                    </DialogDescription>
                    </DialogHeader>
                    <div className="py-4 max-h-[60vh] overflow-y-auto">
                        <p className="text-sm whitespace-pre-wrap">{summary || "No summary generated."}</p>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button type="button" variant="secondary">
                                Close
                            </Button>
                        </DialogClose>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}