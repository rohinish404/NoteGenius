import React from 'react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { PlusCircle, FileText, Trash2, Loader2, LogOut, X } from 'lucide-react';
import type { NoteData } from '@/lib/notes';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle, 
  SheetDescription,
  SheetClose,
} from "@/components/ui/sheet";

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
  isMobile: boolean;
  isMobileSidebarOpen: boolean;
  onCloseMobileSidebar: () => void;
}

const formatDate = (timestamp: number) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffDays = (now.getTime() - date.getTime()) / (1000 * 3600 * 24);

  if (diffDays < 1 && date.getDate() === now.getDate()) {
    return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  } else if (diffDays < 7) {
    return date.toLocaleDateString([], { weekday: 'short' });
  } else {
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  }
};

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
  isMobile,
  isMobileSidebarOpen,
  onCloseMobileSidebar,
}: NoteSidebarProps) {

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className={cn(
        "p-3 md:p-4 border-b border-border flex justify-between items-center flex-shrink-0",
      )}>
        <h2 className="text-base md:text-lg font-semibold">My Notes</h2>
        <div className="flex items-center gap-0 md:gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={onCreateNote}
            title="Add New Note"
            disabled={isCreatingNote || anyMutationPending || isLoadingNotes || isNavigating}
            className="text-muted-foreground hover:text-foreground h-8 w-8"
          >
            {isCreatingNote ? <Loader2 className="h-4 w-4 animate-spin" /> : <PlusCircle className="h-4 w-4" />}
            <span className="sr-only">Add New Note</span>
          </Button>
          {isMobile && (
            <SheetClose asChild>
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground h-8 w-8">
                <X className="h-4 w-4" />
                <span className="sr-only">Close Sidebar</span>
              </Button>
            </SheetClose>
          )}
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto p-2 space-y-1.5">
        {isLoadingNotes ? (
          <div className="space-y-2 p-2">
            {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-10 w-full bg-muted/50" />)}
          </div>
        ) : isErrorNotes ? (
          <p className="text-sm text-destructive text-center p-4">
            Error: {errorNotes?.message || "Failed to load notes"}
          </p>
        ) : notes.length > 0 ? (
          notes.map((note) => (
            <div key={note.id} className="group relative flex items-center">
              <button
                onClick={() => onSelectNote(note.id)}
                disabled={anyMutationPending || isNavigating}
                className={cn(
                  "flex-1 flex items-center gap-2.5 text-left pl-3 pr-8 py-2.5 rounded-md text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 disabled:cursor-not-allowed w-full min-h-[48px]", // Increased min height
                  selectedNoteId === note.id
                    ? "bg-primary/15 text-primary font-medium dark:bg-primary/25"
                    : "text-foreground/70 dark:text-foreground/60 hover:bg-accent hover:text-accent-foreground dark:hover:bg-muted/50"
                )}
                aria-current={selectedNoteId === note.id ? "page" : undefined}
              >
                <FileText className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                <div className="flex-1 overflow-hidden">
                  <p className="truncate font-semibold text-foreground/90 dark:text-foreground/80">{note.title || "Untitled Note"}</p>
                  <p className="text-xs text-muted-foreground truncate">{formatDate(note.lastModified)}</p>
                </div>
              </button>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity text-muted-foreground hover:text-destructive disabled:opacity-0 z-10"
                onClick={(e) => { e.stopPropagation(); onDeleteNote(note.id); }}
                disabled={anyMutationPending || isLoadingNotes || isNavigating || (isDeletingNote && deletingNoteId === note.id)}
                title={`Delete "${note.title || "Untitled"}"`}
              >
                {(isDeletingNote && deletingNoteId === note.id) ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              </Button>
            </div>
          ))
        ) : (
          <p className="text-sm text-muted-foreground text-center p-4 italic">No notes yet. <br /> Click '+' to create one.</p>
        )}
      </nav>

      <div className="p-3 md:p-4 border-t border-border text-xs text-muted-foreground space-y-2 mt-auto flex-shrink-0">
        <div>{isLoadingNotes ? "Loading..." : `${notes.length} note${notes.length !== 1 ? 's' : ''}`}</div>
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
    </div>
  );

  if (isMobile) {
    return (
      <Sheet open={isMobileSidebarOpen} onOpenChange={onCloseMobileSidebar}>
        <SheetContent
          side="left"
          className={cn(
            "w-[85vw] max-w-xs sm:max-w-sm p-0 flex flex-col border-r border-border focus:outline-none",
            "bg-background text-foreground [&>button]:hidden"
          )}
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <SheetHeader className="sr-only">
            <SheetTitle>Notes Sidebar</SheetTitle>
            <SheetDescription>Contains list of notes and actions like create new note or logout.</SheetDescription>
          </SheetHeader>
          <SidebarContent />
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <aside className={cn(
      "hidden md:flex w-64 lg:w-72 border-r border-border flex-col h-screen",
      "bg-muted text-muted-foreground"
    )}>
      <SidebarContent />
    </aside>
  );
}