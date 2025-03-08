import type { Metadata } from 'next'
import Link from 'next/link'
import { Bars2Icon } from '@heroicons/react/20/solid'
import { auth } from '@clerk/nextjs/server'

import { Main } from '@/components/ui'
import TopNav from '@/components/top-nav'
import { getNote, getTags } from '@/server/db/notes'
import Note from './note'

export async function generateMetadata({
  params,
}: {
  params: { id: string }
}): Promise<Metadata> {
  const id = Number(params.id)
  const note = await getNote(id)

  if (!note) {
    return {
      title: 'note does not exist',
    }
  }

  return {
    title: note.title,
  }
}

export default async function NotePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const user = await auth()
  const id = Number((await params).id)
  const note = await getNote(id)
  if (!note) {
    return (
      <>
        <TopNav />
        <Main className='flex flex-col px-4 pb-4'>
          <div className='flex flex-grow flex-col space-y-4'>
            <p>note does not exist</p>
          </div>
        </Main>
        <footer className='sticky bottom-0 flex items-center justify-between bg-cb-dusty-blue px-2 pb-4 pt-2'>
          <div className='flex space-x-4'>
            <Link
              className='text-cb-yellow hover:text-cb-yellow/75 disabled:pointer-events-none disabled:opacity-25'
              href='/notes'
            >
              <Bars2Icon className='h-6 w-6' />
            </Link>
          </div>
          <div className='flex space-x-4'></div>
        </footer>
      </>
    )
  }
  if (!user.userId) {
    return (
      <>
        <TopNav />
        <Main className='flex flex-col'>
          <div className='flex flex-grow flex-col space-y-4'>
            <textarea
              className='h-full w-full flex-grow border-cobalt bg-cobalt caret-cb-yellow focus:border-cobalt focus:ring-0'
              value={note.text}
              readOnly
            />
          </div>
        </Main>
        <footer className='sticky bottom-0 flex items-center justify-between bg-cb-dusty-blue px-2 pb-4 pt-2'>
          <div className='flex space-x-4'>
            <Link
              className='text-cb-yellow hover:text-cb-yellow/75 disabled:pointer-events-none disabled:opacity-25'
              href='/notes'
            >
              <Bars2Icon className='h-6 w-6' />
            </Link>
          </div>
          <div className='flex space-x-4'></div>
        </footer>
      </>
    )
  }
  const allTags = await getTags()
  return <Note note={note} allTags={allTags} />
}
