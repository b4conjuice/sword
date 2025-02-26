'use server'

import 'server-only'

import { revalidatePath } from 'next/cache'
import { auth } from '@clerk/nextjs/server'

import { type Note } from '@/lib/types'
import { saveNote as coreSaveNote } from './db/notes'

const SWORD_TAG = '📖'

export async function saveNote(note: Note) {
  const user = await auth()

  if (!user.userId) throw new Error('unauthorized')

  const tags = note?.tags ?? []
  const newTags = tags.includes(SWORD_TAG) ? tags : [...tags, SWORD_TAG]

  const noteId = await coreSaveNote({ ...note, tags: newTags })

  revalidatePath(`/notes/${noteId}`)
  return noteId
}
