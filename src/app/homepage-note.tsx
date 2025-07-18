'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { SignedIn } from '@clerk/nextjs'
import {
  ArrowDownOnSquareIcon,
  Bars2Icon,
  ChevronLeftIcon,
} from '@heroicons/react/20/solid'

import useLocalStorage from '@/lib/useLocalStorage'
import { saveNote } from '@/server/actions'
import CommandPalette from '@/components/command-palette'

export default function HomePageNote() {
  const router = useRouter()
  const [text, setText] = useLocalStorage('homepage-note', '')

  const readOnly = false // !user || user.username !== note?.author
  const hasChanges = text !== ''
  const canSave = !readOnly && !(!hasChanges || text === '')
  return (
    <>
      <textarea
        className='h-full w-full flex-grow border-cobalt bg-cobalt caret-cb-yellow focus:border-cb-light-blue focus:ring-0'
        value={text}
        onChange={e => {
          setText(e.target.value)
        }}
      />
      <SignedIn>
        <footer className='sticky bottom-0 flex items-center justify-between bg-cb-dusty-blue px-2 pb-6 pt-2'>
          <div className='flex space-x-4'>
            <Link
              href='/notes'
              className='text-cb-yellow hover:text-cb-yellow/75'
            >
              <ChevronLeftIcon className='h-6 w-6' />
            </Link>
          </div>
          <div className='flex space-x-4'>
            <button
              className='flex w-full justify-center text-cb-yellow hover:text-cb-yellow disabled:pointer-events-none disabled:opacity-25'
              type='button'
              onClick={async () => {
                const [title, ...body] = text.split('\n\n')
                const newNote = {
                  text,
                  title: title ?? '',
                  body: body.join('\n\n'),
                  list: [],
                  tags: [],
                }
                const id = await saveNote(newNote)
                setText('')
                router.push(`/notes/${id}`)
              }}
              disabled={!canSave}
            >
              <ArrowDownOnSquareIcon className='h-6 w-6' />
            </button>
          </div>
        </footer>
      </SignedIn>
    </>
  )
}
