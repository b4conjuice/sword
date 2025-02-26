'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import classNames from 'classnames'
import { TagIcon } from '@heroicons/react/24/solid'

import { type Note } from '@/lib/types'
// import useSearch from '@/lib/useSearch'
import useLocalStorage from '@/lib/useLocalStorage'
// import { Modal } from '@/components/ui'
// import { AddTag, ToggleTag } from './tags'
import CommandPalette from '@/components/command-palette'

export default function NoteList({ notes }: { notes: Note[] }) {
  const [isSetTagsModalOpen, setIsSetTagsModalOpen] = useState(false)
  const [isAddNewTagModalOpen, setIsAddNewTagModalOpen] = useState(false)
  const [selectedNoteId, setSelectedNoteId] = useState<number | null>(null)
  const selectedNote = notes.find(note => note.id === selectedNoteId)
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const query = searchParams.get('q')

  const [selectedTags, setSelectedTags] = useLocalStorage<string[]>(
    'notes-selectedTags',
    []
  )
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

  const taggedNotes = notes?.filter(note =>
    selectedTags?.length > 0
      ? selectedTags.every(tag => note.tags?.includes(tag))
      : true
  )
  const results = taggedNotes
  // const { search, setSearch, results, searchRef } = useSearch({
  //   initialSearch: query ? String(query) : '',
  //   list: taggedNotes || [],
  //   options: {
  //     keys: ['title', 'body'],
  //   },
  // })
  // useEffect(() => {
  //   if (query) {
  //     setSearch(String(query))
  //   }
  // }, [query, setSearch])

  const firstTagButtonRef = useRef<HTMLButtonElement | null>(null)
  return (
    <>
      {/* <div className='flex'>
        <input
          ref={searchRef}
          type='text'
          className='w-full bg-cb-blue disabled:pointer-events-none disabled:opacity-25'
          placeholder='search'
          value={search}
          onChange={e => {
            const { value } = e.target
            setSearch(value)
            const url = `${pathname}${value ? `?q=${value}` : ''}`
            router.push(url)
          }}
          disabled={!(notes?.length && notes?.length > 0)}
        />
      </div> */}
      {allTags.length > 0 && (
        <ul className='flex space-x-2 overflow-x-auto'>
          {allTags.map((tag, index) => (
            <li key={tag}>
              <button
                ref={index === 0 ? firstTagButtonRef : undefined}
                className={classNames(
                  'rounded-lg border bg-cb-blue p-2',
                  selectedTags?.includes(tag)
                    ? 'border-cb-pink'
                    : 'border-cb-blue'
                )}
                onClick={() => {
                  const index = selectedTags.findIndex(t => t === tag)
                  const newSelectedTags = [...selectedTags]
                  if (index > -1) {
                    newSelectedTags.splice(index, 1)
                  } else {
                    newSelectedTags.push(tag)
                  }
                  setSelectedTags(newSelectedTags)
                }}
                // TODO: tabIndex={focusTabs ? 0 : -1}
              >
                {tag}
              </button>
            </li>
          ))}
        </ul>
      )}
      <ul className='divide-y divide-cb-dusty-blue'>
        {results.map(note => (
          <li key={note.id} className='group flex space-x-2'>
            <Link
              href={`/notes/${note.id}`}
              className='flex grow items-center justify-between py-4 text-cb-pink hover:text-cb-pink/75 group-first:pt-0'
            >
              <div>
                <div>{note.title}</div>
                {note.tags && note.tags.length > 0 && (
                  <div>{note.tags.join(' ')}</div>
                )}
              </div>
            </Link>
            <div className='flex space-x-2'>
              <button
                type='button'
                onClick={e => {
                  e.preventDefault()
                  if (note?.id) {
                    setSelectedNoteId(note.id)
                    setIsSetTagsModalOpen(true)
                  }
                }}
                tabIndex={-1}
                className='text-cb-yellow hover:text-cb-yellow/75'
              >
                <TagIcon className='h-6 w-6' />
              </button>
            </div>
          </li>
        ))}
      </ul>
      {/* <Modal
        isOpen={isSetTagsModalOpen}
        setIsOpen={setIsSetTagsModalOpen}
        title='edit tags'
      >
        {selectedNote && (
          <ToggleTag
            note={selectedNote}
            allTags={allTags}
            openAddTagModal={() => {
              setIsSetTagsModalOpen(false)
              setIsAddNewTagModalOpen(true)
            }}
          />
        )}
      </Modal>
      <Modal
        isOpen={isAddNewTagModalOpen}
        setIsOpen={setIsAddNewTagModalOpen}
        title='add new tag'
      >
        {selectedNote && (
          <AddTag
            note={selectedNote}
            close={() => {
              setIsAddNewTagModalOpen(false)
            }}
          />
        )}
      </Modal> */}
      <CommandPalette
        commands={[
          {
            id: 'go-home',
            title: 'go home',
            action: () => {
              router.push('/')
            },
          },
          ...notes.map(note => ({
            id: `go-note-${note.id}`,
            title: `go to note: ${note.title}`,
            action: () => {
              router.push(`/notes/${note.id}`)
            },
          })),
        ]}
      />
    </>
  )
}
