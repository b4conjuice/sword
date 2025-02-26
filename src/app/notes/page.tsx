import { Suspense } from 'react'
import type { Viewport } from 'next'
import Link from 'next/link'
import { SignedIn, SignedOut } from '@clerk/nextjs'
import { PencilSquareIcon } from '@heroicons/react/20/solid'

import { Main } from '@/components/ui'
import TopNav from '@/components/top-nav'
import { getNotes } from '@/server/db/notes'
import NoteList from './note-list'
// import NoteList from './note-list'
// import NoteListSkeleton from './note-list-skeleton'

export const viewport: Viewport = {
  themeColor: '#15232d',
}

async function Notes() {
  const notes = await getNotes()
  if (notes.length === 0) return <p>no notes</p>
  return <NoteList notes={notes} />
}

export default function NotesPage() {
  return (
    <>
      <TopNav />
      <Main className='flex flex-col px-4'>
        <div className='flex flex-grow flex-col space-y-4'>
          <SignedIn>
            <Notes />
            {/* <Suspense fallback={<NoteListSkeleton />}>
              <Notes />
            </Suspense> */}
          </SignedIn>
          <SignedOut>
            <p>sign in to view your notes</p>
          </SignedOut>
        </div>
      </Main>
      <footer className='sticky bottom-0 flex items-center justify-between bg-cb-dusty-blue px-2 pb-4 pt-2'>
        <div className='flex space-x-4'></div>
        <div className='flex space-x-4'>
          <Link
            className='text-cb-yellow hover:text-cb-yellow/75 disabled:pointer-events-none disabled:opacity-25'
            href='/'
          >
            <PencilSquareIcon className='h-6 w-6' />
          </Link>
        </div>
      </footer>
    </>
  )
}
