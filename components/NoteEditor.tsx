import React from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, BrainCircuit, Save, Menu, PlusCircle } from 'lucide-react';
import type { NoteData } from '@/lib/notes';
import { cn } from '@/lib/utils';

interface NoteEditorProps {
  note: (NoteData & { lastModified: number }) | null;
  isLoadingNote: boolean;
  isSaving: boolean;
  isSummarizing: boolean;
  anyMutationPending: boolean;
  title: string;
  content: string;
  hasChanges: boolean;
  onTitleChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onContentChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onSave: () => void;
  onSummarize: () => void;
  onBlur: (event: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  errorMessage?: string | null;
  isMobile: boolean;
  onToggleMobileSidebar: () => void;
  onCreateNote: () => void;
  isCreatingNote: boolean;
}

export function NoteEditor({
  note,
  isLoadingNote,
  isSaving,
  isSummarizing,
  anyMutationPending,
  title,
  content,
  hasChanges,
  onTitleChange,
  onContentChange,
  onSave,
  onSummarize,
  onBlur,
  errorMessage,
  isMobile,
  onToggleMobileSidebar,
  onCreateNote,
  isCreatingNote,
}: NoteEditorProps) {
  return (
    <main className="flex-1 flex flex-col overflow-hidden bg-background">
      {isLoadingNote && !note && !errorMessage ? (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
           {isMobile && (
               <Button
                 variant="ghost"
                 size="icon"
                 className="absolute top-3 left-3 md:hidden text-muted-foreground h-9 w-9"
                 onClick={onToggleMobileSidebar}
                 disabled={anyMutationPending}
                 aria-label="Toggle Notes Sidebar"
               >
                 <Menu className="h-5 w-5" />
               </Button>
           )}
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Loading notes...</p>
        </div>
      ) : note ? (
        <>
          <div
            className="p-3 md:p-4 border-b border-border flex items-center justify-between gap-2 md:gap-3 flex-shrink-0 flex-wrap"
            data-editor-interactive
           >
            <div className="flex items-center">
                <Button
                    variant="ghost"
                    size="icon"
                    className="md:hidden text-muted-foreground hover:text-foreground h-9 w-9 mr-1"
                    onClick={onToggleMobileSidebar}
                    disabled={anyMutationPending}
                    aria-label="Toggle Notes Sidebar"
                >
                    <Menu className="h-5 w-5" />
                </Button>
            </div>

            <input
              type="text"
              value={title}
              onChange={onTitleChange}
              onBlur={onBlur}
              placeholder="Untitled Note"
              className="text-lg md:text-xl font-semibold truncate flex-1 min-w-[100px] max-w-full bg-transparent border-none focus:outline-none focus:ring-0 py-1 order-first md:order-none"
              aria-label="Note title"
              disabled={isSaving || anyMutationPending || isSummarizing}
            />

            <div className="flex items-center gap-1.5 flex-shrink-0 flex-nowrap">
              {isSaving && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" aria-label="Saving..." />}
              <Button
                variant="outline"
                size="sm"
                className={cn(
                    "flex items-center justify-center",
                    isMobile ? "h-9 w-9 p-0" : "px-3 py-2" 
                )}
                onClick={onSummarize}
                disabled={!note.id || isSummarizing || isSaving || !content?.trim() || anyMutationPending}
                title="Summarize Note with AI"
                aria-label="Summarize Note"
              >
                <BrainCircuit className="h-4 w-4" />
                <span className={cn("ml-1", isMobile ? "sr-only" : "inline")}>AI</span>
              </Button>
              {hasChanges && !isSaving && (
                <Button
                  variant="ghost"
                   size="sm"
                   className={cn(
                       "flex items-center justify-center",
                       isMobile ? "h-9 w-9 p-0" : "px-3 py-2"
                   )}
                  onClick={onSave}
                  title="Save changes"
                  disabled={anyMutationPending || isSummarizing}
                >
                  <Save className="h-4 w-4" />
                  <span className={cn("ml-1", isMobile ? "sr-only" : "inline")}>Save</span>
                </Button>
              )}
              <p className="text-xs text-muted-foreground whitespace-nowrap">
                Last modified: {new Date(note.lastModified).toLocaleString()}
              </p>
            </div>
          </div>

          <div className="flex-1 p-4 pt-2 md:p-6 md:pt-4 overflow-y-auto">
            <Textarea
              placeholder="Start writing your note here..."
              className="w-full h-full resize-none border-none focus-visible:ring-0 focus:outline-none text-base min-h-[calc(100vh-180px)] bg-transparent p-0 leading-relaxed tracking-wide"
              value={content}
              onChange={onContentChange}
              onBlur={onBlur}
              aria-label="Note content"
              disabled={isSaving || anyMutationPending || isSummarizing}
            />
          </div>
          <div className="p-2 md:p-3 border-t border-border text-xs text-muted-foreground text-right flex-shrink-0">
            {content?.length ?? 0} Characters
          </div>
        </>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center relative">
           {isMobile && (
               <Button
                 variant="ghost"
                 size="icon"
                 className="absolute top-3 left-3 md:hidden text-muted-foreground h-9 w-9"
                 onClick={onToggleMobileSidebar}
                 disabled={anyMutationPending}
                 aria-label="Toggle Notes Sidebar"
               >
                 <Menu className="h-5 w-5" />
               </Button>
           )}
          <p className="text-muted-foreground mb-4 max-w-xs">
            {errorMessage
              ? `Error: ${errorMessage}`
              : isLoadingNote
              ? "Loading..."
              : "Select or create a note."}
          </p>
          {!isLoadingNote && !errorMessage && (
             <Button
                variant="outline"
                size="sm"
                onClick={onCreateNote}
                disabled={anyMutationPending || isCreatingNote}
                className="mt-2"
                data-editor-interactive
             >
                {isCreatingNote ? <Loader2 className="h-4 w-4 animate-spin mr-2"/> : <PlusCircle className="h-4 w-4 mr-2"/>}
                Create Note
             </Button>
          )}
        </div>
      )}
    </main>
  );
}