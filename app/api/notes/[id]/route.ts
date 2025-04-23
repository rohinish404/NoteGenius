import { NextResponse } from 'next/server';
import { getUser } from '@/auth/server';
import { prisma } from '@/db/prisma';

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

export async function PUT(
  request: Request,
  { params }: RouteContext
) {
  try {
    const user = await getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { id } = await params
    const noteId = id;
    const { title, content } = await request.json();

    const existingNote = await prisma.note.findUnique({
      where: {
        id: noteId,
        authorId: user.id,
      },
    });

    if (!existingNote) {
      return NextResponse.json({ error: 'Note not found or not owned by user' }, { status: 404 });
    }

    const updatedNote = await prisma.note.update({
      where: {
        id: noteId,
      },
      data: {
        title: title !== undefined ? title : existingNote.title,
        content: content !== undefined ? content : existingNote.content,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(updatedNote);
  } catch (error) {
    console.error('Failed to update note:', error);
    return NextResponse.json({ error: 'Failed to update note' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: RouteContext
) {
  try {
    const user = await getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { id } = await params;
    const noteId = id;


    const deleteResult = await prisma.note.deleteMany({
      where: {
        id: noteId,
        authorId: user.id,
      },
    });

    if (deleteResult.count === 0) {
        return NextResponse.json({ error: 'Note not found or not owned by user' }, { status: 404 });
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Failed to delete note:', error);
    return NextResponse.json({ error: 'Failed to delete note' }, { status: 500 });
  }
}