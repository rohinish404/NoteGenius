// components/dashboard/SummaryDialog.tsx
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface SummaryDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  noteTitle: string | undefined; // Title of the note being summarized
  summary: string | null;
  isLoading: boolean;
}

export function SummaryDialog({
  isOpen,
  onOpenChange,
  noteTitle,
  summary,
  isLoading,
}: SummaryDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>AI Summary</DialogTitle>
          <DialogDescription>
            Here's a summary of your note "{noteTitle || 'current note'}":
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 max-h-[60vh] overflow-y-auto min-h-[100px] flex items-center justify-center">
          {isLoading ? (
               <Loader2 className="h-6 w-6 animate-spin text-muted-foreground"/>
          ) : (
               <p className="text-sm whitespace-pre-wrap">{summary || "No summary generated."}</p>
          )}
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="secondary" disabled={isLoading}>
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}