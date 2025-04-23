import type { Note } from "@prisma/client/wasm";

export type NoteData = Omit<Note, 'authorId' | 'createdAt' | 'updatedAt'> & {
    updatedAt: string;
    createdAt: string;
};

export type NoteInput = Partial<Pick<Note, "title" | "content">>;

const NOTES_API_ENDPOINT = '/api/notes';

export const fetchNotes = async (): Promise<NoteData[]> => {
  const response = await fetch(NOTES_API_ENDPOINT);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
  }
  return response.json();
};

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

export const deleteNote = async (id: string): Promise<{ success: boolean }> => {
  const response = await fetch(`${NOTES_API_ENDPOINT}/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to delete note');
  }
   const text = await response.text();
   try {
       return text ? JSON.parse(text) : { success: true }; 
   } catch (e) {
       console.error("Failed to parse DELETE response:", e);
       throw new Error("Invalid response from server after delete");
   }
};