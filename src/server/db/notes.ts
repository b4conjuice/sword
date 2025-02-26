'use server'

import 'server-only'

import { revalidatePath } from 'next/cache'
import { auth } from '@clerk/nextjs/server'
import { and, eq } from 'drizzle-orm'

import { type Note } from '@/lib/types'
import { db } from '@/server/db'
import { notes } from '@/server/db/schema'

export async function saveNote(note: Note) {
  const user = await auth()

  if (!user.userId) throw new Error('unauthorized')

  const isList = note.title.startsWith('= ')
  const list = isList ? note.body.split('\n').filter(item => item !== '') : []

  const newNotes = await db
    .insert(notes)
    .values({
      ...note,
      list,
      author: user.userId,
    })
    .onConflictDoUpdate({
      target: notes.id,
      set: {
        text: note.text,
        title: note.title,
        body: note.body,
        list,
        tags: note.tags,
      },
    })
    .returning()
  if (!newNotes || newNotes.length < 0) {
    throw new Error('something went wrong')
  }
  const newNote = newNotes[0]
  if (!newNote) {
    throw new Error('something went wrong')
  }
  revalidatePath(`/notes/${newNote.id}`)
  return newNote.id
}

export async function getNotes() {
  const user = await auth()

  if (!user.userId) throw new Error('unauthorized')

  const notes = await db.query.notes.findMany({
    where: (model, { eq }) => eq(model.author, user.userId),
    orderBy: (model, { desc }) => desc(model.updatedAt),
  })
  return notes
}

export async function getNote(id: number) {
  const note = await db.query.notes.findFirst({
    where: (model, { eq }) => and(eq(model.id, id)),
  })

  return note
}

export async function deleteNote(id: number, currentPath = '/') {
  const user = await auth()

  if (!user.userId) throw new Error('unauthorized')

  // TODO: somehow check if note is related to an item in a different table

  await db
    .delete(notes)
    .where(and(eq(notes.id, id), eq(notes.author, user.userId)))
  revalidatePath(currentPath)
}

export async function getTags() {
  const user = await auth()

  if (!user.userId) throw new Error('unauthorized')

  const notes = await getNotes()

  const allTags = notes
    ? [
        ...new Set(
          notes.reduce((allTagsFoo: string[], note: Note) => {
            const { tags } = note
            const noteTags = tags ? [...tags] : []
            return [...allTagsFoo, ...noteTags]
          }, [])
        ),
      ]
    : []

  return allTags
}
