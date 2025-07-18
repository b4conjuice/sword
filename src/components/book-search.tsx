import { useState, useEffect } from 'react'
import classNames from 'classnames'
import { MagnifyingGlassIcon } from '@heroicons/react/20/solid'
import {
  Combobox,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
} from '@headlessui/react'
import Fuse from 'fuse.js'

import type { Scripture } from '@/lib/types'
import books, {
  booksAndChaptersMap,
  transformScripturetoText,
  transformTextToScripture,
} from '@/lib/books'
import useHistory from '@/lib/useHistory'

type Command = {
  id: string
  title: string
  subtitle?: string
  action: (args?: unknown) => void | Promise<unknown>
}

const SHORTCUT_KEY = 'k'

function CommandPalette({
  commands,
  defaultCommands,
  placeholder = 'search commands',
  ref,
  createCustomCommand,
}: {
  commands: Command[]
  defaultCommands: Command[]
  placeholder?: string
  ref: React.RefObject<HTMLInputElement>
  createCustomCommand?: (query: string) => Command | null
}) {
  const [query, setQuery] = useState('')

  // TODO: add option to disable this
  useEffect(() => {
    function onKeydown(e: KeyboardEvent) {
      if (e.key === SHORTCUT_KEY && (e.metaKey || e.ctrlKey)) {
        ref.current?.focus()
      }
    }
    window.addEventListener('keydown', onKeydown)
    return () => {
      window.removeEventListener('keydown', onKeydown)
    }
  }, [ref])

  const fuse = new Fuse(commands, {
    keys: ['id', 'title', { name: 'name', weight: 2 }],
  })

  const customCommand = createCustomCommand ? createCustomCommand(query) : null
  const filteredCommands = [
    ...(query.length > 0 && customCommand ? [customCommand] : []),
    ...(!query
      ? defaultCommands
      : fuse.search(query.toLowerCase()).map(({ item }) => item)),
  ]
  return (
    <>
      <Combobox
        as='div'
        onChange={(command: Command) => {
          if (command?.action) {
            void command.action()
          }
        }}
        onClose={() => {
          setQuery('')
        }}
        className='divide-y divide-cb-dusty-blue overflow-hidden rounded-xl bg-cb-blue shadow-2xl ring-1 ring-cb-light-blue'
        virtual={{
          options: filteredCommands,
        }}
        // immediate
      >
        {({ activeOption }) => (
          <>
            <div className='flex items-center space-x-2 px-4'>
              <MagnifyingGlassIcon className='h-6 w-6 text-cb-yellow' />
              <ComboboxInput
                ref={ref}
                value={query}
                onChange={e => {
                  setQuery(e.target.value)
                }}
                className='h-12 w-full border-0 bg-transparent placeholder-cb-yellow/75 focus:outline-0 focus:ring-0'
                placeholder={placeholder}
                onKeyDown={e => {
                  if (e.key === 'Tab' && query.length > 0) {
                    e.preventDefault()
                    if (activeOption) {
                      const title = (activeOption as Command).title
                      setQuery(title)
                    }
                  }
                }}
              />
            </div>

            <ComboboxOptions className='max-h-40 overflow-y-auto py-4 text-sm empty:invisible'>
              {({ option: command }: { option: Command }) => (
                <ComboboxOption value={command} className='w-full'>
                  {({ active }) => (
                    <div
                      className={classNames(
                        'flex items-center space-x-1 px-4 py-2',
                        active ? 'bg-sword-purple' : ''
                      )}
                    >
                      <div className='flex-grow'>
                        <span
                          className={classNames(
                            'font-medium',
                            active ? 'text-cb-yellow' : ''
                          )}
                        >
                          {command.title}
                        </span>
                        {command.subtitle && (
                          <span
                            className={`${
                              active ? 'text-indigo-200' : 'text-gray-400'
                            }`}
                          >
                            - {command.subtitle}
                          </span>
                        )}
                      </div>
                      {/* <button
                        type='button'
                        className='text-cb-yellow hover:text-cb-yellow/75 hover:cursor-pointer'
                        onClick={e => {
                          e.preventDefault()
                          setQuery(command.title)
                        }}
                      >
                        <ArrowUpLeftIcon className='h-6 w-6' />
                      </button> */}
                    </div>
                  )}
                </ComboboxOption>
              )}
            </ComboboxOptions>
            {query && filteredCommands.length === 0 && (
              <p className='p-4 text-sm text-gray-500'>no results found</p>
            )}
          </>
        )}
      </Combobox>
    </>
  )
}

export default function BookSearch({
  searchRef,
  showRecentCommands,
  defaultCommands = [],
  onSelectBook,
}: {
  searchRef: React.RefObject<HTMLInputElement>
  showRecentCommands?: boolean
  defaultCommands?: Command[]
  onSelectBook: (scripture: Scripture) => void
}) {
  const { history, addHistory } = useHistory()

  const commands = books
    .map((bookName, index) => {
      const bookNumber = index + 1
      const bookChapters = bookName ? (booksAndChaptersMap[bookName] ?? 1) : 1

      return Array.from(
        {
          length: bookChapters,
        },
        (_, i) => i + 1
      ).map(bookChapter => {
        const scripture: Scripture = {
          bookName: bookName,
          bookNumber: bookNumber,
          chapter: bookChapter,
        }
        const text = transformScripturetoText(scripture)
        return {
          id: `go-${text}`,
          title: `${bookName} ${bookChapter}`,
          action: async () => {
            addHistory(scripture)
            if (onSelectBook) {
              onSelectBook(scripture)
            }
          },
        }
      })
    })
    .flat()

  const createCustomCommand = (query: string) => {
    const text = transformScripturetoText(query)
    const scripture = transformTextToScripture(text)
    if (scripture === '') {
      return null
    }
    const customCommand: Command = {
      id: `custom-go-${text}`,
      title: scripture.asString ?? '',
      action: async () => {
        addHistory(scripture)
        if (onSelectBook) {
          onSelectBook(scripture)
        }
      },
    }
    return customCommand
  }

  const recentCommands =
    history?.slice(-3).map(({ scripture, url }) => ({
      id: `go-${scripture.text}`,
      title: `${scripture.asString}`,
      action: () => {
        addHistory(scripture)
        window.open(url)
      },
    })) ?? []

  const seenIds = new Set()
  const uniqueRecentCommands = []

  for (const obj of recentCommands) {
    const id = obj.id
    if (!seenIds.has(id)) {
      seenIds.add(id)
      uniqueRecentCommands.push(obj)
    }
  }

  return (
    <>
      <CommandPalette
        commands={commands}
        defaultCommands={
          showRecentCommands
            ? [...defaultCommands, ...uniqueRecentCommands]
            : [...defaultCommands]
        }
        placeholder='search books'
        ref={searchRef}
        createCustomCommand={createCustomCommand}
      />
    </>
  )
}
