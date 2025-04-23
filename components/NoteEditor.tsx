import React from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, BrainCircuit, Save } from 'lucide-react';
import type { NoteData } from '@/lib/notes';

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
  onBlur: () => void;
  errorMessage?: string | null;
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
}: NoteEditorProps) {
  return (
    <main className="flex-1 flex flex-col overflow-hidden">
      {isLoadingNote && !note ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <p className="text-muted-foreground">Loading note...</p>
        </div>
      ) : note ? (
        <>
          <div className="p-4 border-b border-border flex items-center justify-between gap-4 flex-wrap">
            <input
              type="text"
              value={title}
              onChange={onTitleChange}
              onBlur={onBlur}
              placeholder="Note title"
              className="text-xl font-semibold truncate flex-1 bg-transparent border-none focus:outline-none focus:ring-0 min-w-[100px]"
              aria-label="Note title"
              disabled={isSaving || anyMutationPending}
            />
            <div className="flex items-center gap-2 flex-shrink-0">
              {isSaving && <Loader2 className="h-4 w-4 animate-spin mr-1" aria-label="Saving..." />}
              <Button
                variant="outline"
                size="sm"
                onClick={onSummarize}
                disabled={!note.id || isSummarizing || isSaving || !content?.trim() || anyMutationPending}
                title={!content?.trim() ? "Cannot summarize empty note" : "Summarize Note with AI"}
              >
                {isSummarizing ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <BrainCircuit className="h-4 w-4 mr-1" />}
                Summarize
              </Button>
              {hasChanges && !isSaving && (
                <Button variant="ghost" size="sm" onClick={onSave} title="Save changes" disabled={anyMutationPending}>
                  <Save className="h-4 w-4 mr-1" /> Save
                </Button>
              )}
              <p className="text-xs text-muted-foreground whitespace-nowrap">
                Last modified: {new Date(note.lastModified).toLocaleString()}
              </p>
            </div>
          </div>
          <div className="flex-1 p-4 md:p-6 overflow-y-auto">
            <Textarea
              placeholder="Start writing your note..."
              className="w-full h-full resize-none border-none focus-visible:ring-0 focus:outline-none text-base min-h-[300px] bg-transparent p-0"
              value={content}
              onChange={onContentChange}
              onBlur={onBlur}
              aria-label="Note content"
              disabled={isSaving || anyMutationPending}
            />
          </div>
          <div className="p-3 border-t border-border text-sm text-muted-foreground text-right">
            Character count: {content.length}
          </div>
        </>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">
            {errorMessage
              ? `Error: ${errorMessage}`
              : isLoadingNote
              ? "Loading notes..."
              : "Select a note or create a new one."}
          </p>
        </div>
      )}
    </main>
  );
}