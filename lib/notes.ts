// lib/api/notes.ts
import type { Note } from "@prisma/client/wasm"; // Use Prisma's generated type

// Type definition matching Prisma model closely (or use Prisma types directly)
export type NoteData = Omit<Note, 'authorId' | 'createdAt' | 'updatedAt'> & {
    updatedAt: string; // API likely returns string dates
    createdAt: string;
};

export type NoteInput = Partial<Pick<Note, "title" | "content">>;

const NOTES_API_ENDPOINT = '/api/notes';

// Fetch all notes
export const fetchNotes = async (): Promise<NoteData[]> => {
  const response = await fetch(NOTES_API_ENDPOINT);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({})); // Try to parse error
    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
  }
  return response.json();
};

// Create a new note
export const createNote = async (noteData: NoteInput): Promise<NoteData> => {
  const response = await fetch(NOTES_API_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(noteData),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to create note');
  }
  return response.json();
};

// Update an existing note
export const updateNote = async ({ id, ...noteData }: NoteInput & { id: string }): Promise<NoteData> => {
  const response = await fetch(`${NOTES_API_ENDPOINT}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(noteData),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to update note');
  }
  return response.json();
};

// Delete a note
export const deleteNote = async (id: string): Promise<{ success: boolean }> => {
  const response = await fetch(`${NOTES_API_ENDPOINT}/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to delete note');
  }
   // Check if response has content before parsing
   const text = await response.text();
   try {
       return text ? JSON.parse(text) : { success: true }; // Assume success if empty body
   } catch (e) {
       console.error("Failed to parse DELETE response:", e);
       throw new Error("Invalid response from server after delete");
   }
};