import React from 'react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { PlusCircle, FileText, Trash2, Loader2, LogOut } from 'lucide-react';
import type { NoteData } from '@/lib/notes';

interface NoteSidebarProps {
  notes: (NoteData & { lastModified: number })[];
  selectedNoteId: string | null;
  isLoadingNotes: boolean;
  isErrorNotes: boolean;
  errorNotes: Error | null;
  isCreatingNote: boolean;
  isDeletingNote: boolean;
  deletingNoteId: string | null;
  isLoggingOut: boolean;
  anyMutationPending: boolean;
  isNavigating: boolean;
  onSelectNote: (noteId: string) => void;
  onDeleteNote: (noteId: string) => void;
  onCreateNote: () => void;
  onLogout: () => void;
}

export function NoteSidebar({
  notes,
  selectedNoteId,
  isLoadingNotes,
  isErrorNotes,
  errorNotes,
  isCreatingNote,
  isDeletingNote,
  deletingNoteId,
  isLoggingOut,
  anyMutationPending,
  isNavigating,
  onSelectNote,
  onDeleteNote,
  onCreateNote,
  onLogout,
}: NoteSidebarProps) {
  return (
    <aside className="w-64 md:w-72 border-r border-border flex flex-col bg-muted/30 dark:bg-muted/10">
      <div className="p-4 border-b border-border flex justify-between items-center">
        <h2 className="text-lg font-semibold">My Notes</h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={onCreateNote}
          title="Add New Note"
          disabled={isCreatingNote || anyMutationPending || isLoadingNotes}
        >
          {isCreatingNote ? <Loader2 className="h-5 w-5 animate-spin" /> : <PlusCircle className="h-5 w-5" />}
        </Button>
      </div>
      <nav className="flex-1 overflow-y-auto p-2 space-y-1">
        {isLoadingNotes ? (
          <div className="space-y-2 p-2">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-5/6" />
          </div>
        ) : isErrorNotes ? (
          <p className="text-sm text-destructive text-center p-4">
            Error loading notes: {errorNotes?.message || "Unknown error"}
          </p>
        ) : notes.length > 0 ? (
          notes.map((note) => (
            <div key={note.id} className="group relative flex items-center">
              <button
                onClick={() => onSelectNote(note.id)}
                disabled={anyMutationPending || isNavigating}
                className={cn(
                  "flex-1 flex items-center gap-3 text-left px-3 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 disabled:cursor-not-allowed",
                  selectedNoteId === note.id
                    ? "bg-primary/10 text-primary dark:bg-primary/20"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground dark:hover:bg-muted/50"
                )}
              >
                <FileText className="h-4 w-4 flex-shrink-0" />
                <span className="truncate flex-1">{note.title || "Untitled"}</span>
              </button>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 h-7 w-7 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity text-muted-foreground hover:text-destructive disabled:opacity-0"
                onClick={(e) => { e.stopPropagation(); onDeleteNote(note.id); }}
                disabled={anyMutationPending || isLoadingNotes || (isDeletingNote && deletingNoteId === note.id)}
                title={`Delete "${note.title || "Untitled"}"`}
              >
               {(isDeletingNote && deletingNoteId === note.id) ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              </Button>
            </div>
          ))
        ) : (
          <p className="text-sm text-muted-foreground text-center p-4">No notes yet. Create one!</p>
        )}
      </nav>
      <div className="p-4 border-t border-border text-xs text-muted-foreground space-y-2">
        <div>{isLoadingNotes ? "Loading..." : `${notes.length} notes`}</div>
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-start"
          onClick={onLogout}
          disabled={isLoggingOut || anyMutationPending}
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
  );
}