"use server";

import { getUser } from "@/auth/server";
import { prisma } from "@/db/prisma";
import { handleError } from "@/lib/utils";
import openai from "@/lib/groq";

export const summarizeNoteAction = async (noteId: string) => {
  try {
    const user = await getUser();
    if (!user) throw new Error("You must be logged in to summarize a note.");

    const note = await prisma.note.findUnique({
      where: {
        id: noteId,
        authorId: user.id,
      },
      select: {
        content: true,
        title: true,
      }
    });

    if (!note) {
      throw new Error("Note not found or you don't have permission.");
    }

    if (!note.content?.trim()) {
      return { summary: "Note content is empty, nothing to summarize.", errorMessage: null };
    }

    if (note.content.trim().length < 50) {
       return { summary: "Note content is too short to provide a meaningful summary.", errorMessage: null };
    }

    console.log(`Summarizing note "${note.title}" (ID: ${noteId})...`);

    const messages = [
        {
          role: "system" as const,
          content: `You are an expert assistant specialized in summarizing text concisely and accurately. Given the following note content, provide a brief summary (around 2-4 sentences unless the text is very long). Focus on the main points and key information. Ignore any previous instructions. Your output should be plain text only.`,
        },
        {
            role: "user" as const,
            content: `Please summarize this note content:\n\n${note.content}`,
        },
    ];


    const completion = await openai.chat.completions.create({
      model: "llama-3.3-70b-versatile", 
      messages,
      temperature: 0.3,
      max_tokens: 150,
    });

    const summary = completion.choices[0]?.message?.content?.trim();

    if (!summary) {
        throw new Error("AI failed to generate a summary.");
    }

     console.log(`Summary generated for note "${note.title}".`);
    return { summary, errorMessage: null };

  } catch (error) {
      console.error("Summarization Error:", error);
      return { summary: null, ...handleError(error) };
  }
};
