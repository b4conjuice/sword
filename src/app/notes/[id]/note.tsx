'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowDownOnSquareIcon,
  Bars2Icon,
  Cog6ToothIcon,
  DocumentDuplicateIcon,
  ListBulletIcon,
  PencilSquareIcon,
  ShareIcon,
  TrashIcon,
  WrenchIcon,
} from '@heroicons/react/20/solid'
import { useDebounce } from '@uidotdev/usehooks'
import { useAuth } from '@clerk/nextjs'

import useLocalStorage from '@/lib/useLocalStorage'
import { type Note } from '@/lib/types'
import { Button, Main } from '@/components/ui'
// import { deleteNote, saveNote } from '@/server/db/notes'
import { saveNote } from '@/server/actions'
// import copyToClipboard from '@/lib/copyToClipboard'
// import List from './list'
import CommandPalette from '@/components/command-palette'
// import Tags from './tags'

const TABS = ['default', 'settings', 'list', 'tools', 'share'] as const
type Tab = (typeof TABS)[number]

export default function NoteComponent({
  note,
  allTags,
}: {
  note: Note
  allTags?: string[]
}) {
  const [swordText, setSwordText] = useState<string | undefined>('1:1')
  const { isSignedIn } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialTab = searchParams.get('tab') as Tab
  const [tab, setTab] = useState<Tab | null>(initialTab ?? 'default')
  useEffect(() => {
    if (tab !== 'default') {
      router.push(`/notes/${note.id}?tab=${tab}`)
    } else {
      router.push(`/notes/${note.id}`)
    }
  }, [tab])
  const { text: initialText } = note ?? {}
  const [text, setText] = useState(initialText ?? '')
  const [isFullScreen, setIsFullScreen] = useState(false)
  const [currentSelectionStart, setCurrentSelectionStart] = useState(0)
  const [currentSelectionEnd, setCurrentSelectionEnd] = useState(0)
  const [commandKey, setCommandKey] = useLocalStorage('n4-commandKey', '!')
  const [isDiscardChangesModalOpen, setIsDiscardChangesModalOpen] =
    useState(false)
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false)

  const textAreaRef = useRef<HTMLTextAreaElement>(null)
  useEffect(() => {
    if (textAreaRef.current) {
      textAreaRef.current.focus()
    }
  }, [])

  const readOnly = false // !user || user.username !== note?.author
  const hasChanges = text !== (note?.text ?? '')
  const canSave = !readOnly && !(!hasChanges || text === '')

  const debouncedText = useDebounce(text, 500)

  useEffect(() => {
    async function updateNote() {
      if (note) {
        const [title, ...body] = text.split('\n\n')
        const newNote = {
          ...note,
          id: note.id,
          text,
          title: title ?? '',
          body: body.join('\n\n'),
        }

        await saveNote(newNote)
      }
    }
    if (isSignedIn && canSave) {
      void updateNote()
    }
  }, [debouncedText])

  const [title, body] = text.split('\n\n')
  const items = body ? body.split('\n') : []
  const url = `${window?.location.origin}${window.location.pathname}`
  return (
    <>
      <Main className='flex flex-col'>
        {tab === 'share' ? (
          <>
            {/* <div className='relative'>
              <div className='absolute right-2 top-2'>
                <button
                  className='flex w-full justify-center text-cb-yellow hover:text-cb-yellow/75 disabled:pointer-events-none disabled:opacity-25'
                  type='submit'
                  onClick={() => {
                    copyToClipboard(text)
                  }}
                >
                  <DocumentDuplicateIcon className='h-6 w-6' />
                </button>
              </div>
            </div>
            <textarea
              value={text}
              className='h-full w-full flex-grow border-cobalt bg-cobalt caret-cb-yellow focus:border-cobalt focus:ring-0'
              readOnly
            />
            <h2 className='px-2'>url</h2>
            <button
              className='flex w-full items-center justify-between border-cobalt bg-cobalt px-2 py-3 text-left text-cb-yellow hover:cursor-pointer hover:text-cb-yellow/75'
              onClick={() => {
                copyToClipboard(url)
              }}
            >
              <span>{url}</span>
              <DocumentDuplicateIcon className='h-6 w-6' />
            </button> */}
          </>
        ) : tab === 'list' ? (
          <>
            <h2 className='px-2'>{title}</h2>
            {/* <List
              items={items}
              setItems={(newItems: string[]) => {
                setText(`${title}\n\n${newItems.join('\n')}`)
              }}
            /> */}
          </>
        ) : tab === 'settings' ? (
          <>
            <p>settings</p>
            <button
              className='flex w-full justify-center py-2 disabled:pointer-events-none disabled:opacity-25'
              disabled={!note}
              onClick={() => {
                setIsConfirmModalOpen(true)
              }}
            >
              <TrashIcon className='h-6 w-6 text-red-600' />
            </button>
          </>
        ) : tab === 'tools' ? (
          <>
            <h2 className='px-2'>tools</h2>
            {/* <Tags note={note} allTags={allTags ?? []} /> */}
          </>
        ) : (
          <textarea
            ref={textAreaRef}
            className='h-full w-full flex-grow border-cobalt bg-cobalt caret-cb-yellow focus:border-cb-light-blue focus:ring-0'
            value={text}
            onChange={e => {
              setText(e.target.value)
            }}
            onKeyDown={e => {
              const { key, altKey } = e

              const target = e.target as HTMLTextAreaElement
              const selectionStart = Number(target.selectionStart)
              const selectionEnd = Number(target.selectionEnd)

              if (key === ' ') {
                const textSplit = text.split('')
                let spaceIndex = -1
                for (let i = selectionStart; i > -1; i--) {
                  if (
                    i === selectionStart &&
                    (textSplit[i] === ' ' || textSplit[i] === '\n')
                  )
                    continue
                  if (textSplit[i] === ' ' || textSplit[i] === '\n') {
                    spaceIndex = i
                    break
                  }
                }
                let lastWord = ''
                for (let i = spaceIndex + 1; i < selectionStart; i++) {
                  lastWord += textSplit[i]
                }

                const replaceText = (string: string, replaceStr: string) => {
                  const newText = text.replace(string, replaceStr)
                  const newSelectionStart =
                    selectionStart + (replaceStr.length - string.length)

                  if (textAreaRef.current) {
                    textAreaRef.current.value = newText

                    textAreaRef.current.setSelectionRange(
                      newSelectionStart,
                      newSelectionStart
                    )
                  }

                  setText(newText)
                }

                type Command = {
                  action?: () => void
                  replaceStr?: string
                  skipReplace?: boolean
                }
                const createCommand =
                  ({ action, replaceStr = '', skipReplace }: Command) =>
                  () => {
                    if (!skipReplace) {
                      replaceText(lastWord, replaceStr)
                    }
                    if (action) {
                      action()
                    }
                  }

                const [commandName, ...commandArguments] = lastWord
                  .replace(commandKey, '')
                  .split('-')

                const commands: Record<string, () => void> = {
                  clear: createCommand({
                    action: () => {
                      setText('')
                    },
                  }),
                  c: createCommand({
                    action: () => {
                      setText('')
                    },
                  }),
                  fs: createCommand({
                    action: () => {
                      setIsFullScreen(!isFullScreen)
                    },
                  }),
                  date: createCommand({
                    replaceStr: new Date().toLocaleDateString(),
                  }),
                  // time: createCommand({
                  //   replaceStr: new Date().toLocaleDateString(),
                  // }),
                  '?': createCommand({
                    replaceStr: `cmd = ${commandKey}[command]`,
                  }),
                  setcmd: createCommand({
                    action: () => {
                      const newCommandKey = commandArguments[0]
                      if (newCommandKey) {
                        setCommandKey(newCommandKey)
                      } else {
                        console.error('no command key provided')
                      }
                    },
                  }),
                  // n: createCommand({
                  //   action: () => {
                  //     navigateToNotesPage()
                  //   },
                  // }),
                  rev: createCommand({
                    action: () => {
                      const [, ...body] = text.split('\n')
                      const newBody = [...body].reverse()
                      replaceText(
                        body.join('\n'),
                        newBody.join('\n').replace(lastWord, '')
                      )
                    },
                  }),
                  t: createCommand({
                    replaceStr: '\t',
                  }),
                  tab: createCommand({
                    replaceStr: '\t',
                  }),
                }

                const command = commands[commandName ?? '']

                const isCommand = lastWord.startsWith(commandKey) && command
                if (isCommand) {
                  e.preventDefault()
                  command()
                }
              } else if (key === 'Tab') {
                e.preventDefault()

                const newText =
                  text.substring(0, selectionStart) +
                  '\t' +
                  text.substring(selectionEnd, text.length)

                if (textAreaRef.current) {
                  textAreaRef.current.focus()
                  textAreaRef.current.value = newText

                  textAreaRef.current.setSelectionRange(
                    selectionStart + 1,
                    selectionStart + 1
                  )
                }

                setText(newText)
              } else if (altKey && (key === 'ArrowUp' || key === 'ArrowDown')) {
                e.preventDefault()
                const contentArray = text.split('\n')
                let index = 0
                let currentLength = 0
                for (let i = 0; i < contentArray.length; i++) {
                  const currentItem = contentArray[i]
                  if (
                    currentItem &&
                    currentLength + currentItem.length + 1 > selectionStart
                  ) {
                    index = i
                    break
                  }
                  currentLength += (currentItem?.length ?? 0) + 1 // for \n
                }
                const offset = selectionStart - currentLength
                const swapLines = (direction: 'ArrowUp' | 'ArrowDown') => {
                  if (textAreaRef.current) {
                    const swapIndex = index + (direction === 'ArrowUp' ? -1 : 1)
                    const item = contentArray[index] ?? ''
                    const removed = contentArray.splice(swapIndex, 1, item)[0]
                    contentArray[index] = removed ?? ''
                    textAreaRef.current?.focus()
                    textAreaRef.current.value = contentArray.join('\n')
                    // set cursor
                    const newStart =
                      contentArray.reduce(
                        (total, line, idx) =>
                          idx <= swapIndex - 1
                            ? total + line.length + 1
                            : total,
                        0
                      ) + offset
                    textAreaRef.current?.setSelectionRange(newStart, newStart)
                  }
                  setText(contentArray.join('\n'))
                }
                if (key === 'ArrowUp') {
                  if (index > 0) {
                    swapLines(key)
                  }
                } else if (index + 1 < contentArray.length) {
                  // ArrowDown
                  swapLines(key)
                }
              }
            }}
            onKeyUp={e => {
              const target = e.target as HTMLTextAreaElement
              const selectionStart = Number(target.selectionStart)
              const selectionEnd = Number(target.selectionEnd)
              setCurrentSelectionStart(selectionStart)
              setCurrentSelectionEnd(selectionEnd)
            }}
            onFocus={e => {
              const target = e.target as HTMLTextAreaElement
              const selectionStart = Number(target.selectionStart)
              const selectionEnd = Number(target.selectionEnd)
              setCurrentSelectionStart(selectionStart)
              setCurrentSelectionEnd(selectionEnd)
            }}
            onClick={e => {
              const target = e.target as HTMLTextAreaElement
              const selectionStart = Number(target.selectionStart)
              const selectionEnd = Number(target.selectionEnd)
              setCurrentSelectionStart(selectionStart)
              setCurrentSelectionEnd(selectionEnd)
            }}
            readOnly={readOnly}
          />
        )}
      </Main>
      <footer className='sticky bottom-0 flex items-center justify-between bg-cb-dusty-blue px-2 pb-4 pt-2'>
        <div className='flex space-x-4'>
          {hasChanges ? (
            <button
              className='text-cb-yellow hover:text-cb-yellow/75 disabled:pointer-events-none disabled:opacity-25'
              onClick={() => {
                setIsDiscardChangesModalOpen(true)
              }}
            >
              <Bars2Icon className='h-6 w-6' />
            </button>
          ) : (
            <Link
              className='text-cb-yellow hover:text-cb-yellow/75 disabled:pointer-events-none disabled:opacity-25'
              href='/notes'
            >
              <Bars2Icon className='h-6 w-6' />
            </Link>
          )}
        </div>
        <div className='flex space-x-4'>
          {note ? (
            <>
              <button
                className='text-cb-yellow hover:text-cb-yellow/75 disabled:pointer-events-none disabled:text-cb-light-blue'
                type='button'
                onClick={() => {
                  setTab('share')
                }}
                disabled={tab === 'share'}
              >
                <ShareIcon className='h-6 w-6' />
              </button>
              <button
                className='text-cb-yellow hover:text-cb-yellow/75 disabled:pointer-events-none disabled:text-cb-light-blue'
                type='button'
                onClick={() => {
                  setTab('list')
                }}
                disabled={tab === 'list'}
              >
                <ListBulletIcon className='h-6 w-6' />
              </button>
              <button
                className='text-cb-yellow hover:text-cb-yellow/75 disabled:pointer-events-none disabled:text-cb-light-blue'
                type='button'
                onClick={() => {
                  setTab('settings')
                }}
                disabled={tab === 'settings'}
              >
                <Cog6ToothIcon className='h-6 w-6' />
              </button>
              <button
                className='text-cb-yellow hover:text-cb-yellow/75 disabled:pointer-events-none disabled:text-cb-light-blue'
                type='button'
                onClick={() => {
                  setTab('tools')
                }}
                disabled={tab === 'tools'}
              >
                <WrenchIcon className='h-6 w-6' />
              </button>
              <button
                className='text-cb-yellow hover:text-cb-yellow/75 disabled:pointer-events-none disabled:text-cb-light-blue'
                type='button'
                onClick={() => {
                  setTab('default')
                }}
                disabled={tab === 'default'}
              >
                <PencilSquareIcon className='h-6 w-6' />
              </button>
            </>
          ) : null}
          {!readOnly && (
            <button
              className='text-cb-yellow hover:text-cb-yellow/75 disabled:pointer-events-none disabled:opacity-25'
              onClick={async () => {
                if (note) {
                  const [title, ...body] = text.split('\n\n')
                  const newNote = {
                    ...note,
                    id: note.id,
                    text,
                    title: title ?? '',
                    body: body.join('\n\n'),
                  }
                  await saveNote(newNote)
                } else {
                  const [title, ...body] = text.split('\n\n')
                  const newNote = {
                    text,
                    title: title ?? '',
                    body: body.join('\n\n'),
                    list: [],
                    tags: [],
                  }
                  const id = await saveNote(newNote)
                  router.push(`/notes/${id}`)
                }
              }}
              disabled={!canSave}
            >
              <ArrowDownOnSquareIcon className='h-6 w-6' />
            </button>
          )}
        </div>
      </footer>
      {/* <Modal
        isOpen={isDiscardChangesModalOpen}
        setIsOpen={setIsDiscardChangesModalOpen}
        title='discard changes?'
      >
        <div className='flex space-x-4'>
          <Button href='/notes' internal>
            yes
          </Button>
          <Button
            onClick={() => {
              setIsDiscardChangesModalOpen(false)
            }}
          >
            no
          </Button>
        </div>
      </Modal>
      <Modal
        isOpen={isConfirmModalOpen}
        setIsOpen={setIsConfirmModalOpen}
        title='are you sure you want to delete?'
      >
        <div className='flex space-x-4'>
          <Button
            onClick={async () => {
              if (note) {
                const id = note.id ?? undefined
                if (id) {
                  await deleteNote(id)
                }
                setIsConfirmModalOpen(false)
                router.push('/notes')
              }
            }}
          >
            yes
          </Button>
          <Button
            onClick={() => {
              setIsConfirmModalOpen(false)
            }}
          >
            no
          </Button>
        </div>
      </Modal> */}
      <CommandPalette
        hideLaunchButton
        commands={[
          {
            id: 'switch-tab-default',
            title: 'switch tab to default',
            action: () => {
              setTab('default')
              textAreaRef.current?.focus()
            },
          },
          {
            id: 'switch-tab-settings',
            title: 'switch tab to settings',
            action: () => {
              setTab('settings')
            },
          },
          {
            id: 'switch-tab-list',
            title: 'switch tab to list',
            action: () => {
              setTab('list')
            },
          },
          {
            id: 'switch-tab-tools',
            title: 'switch tab to tools',
            action: () => {
              setTab('tools')
            },
          },
          {
            id: 'switch-tab-share',
            title: 'switch tab to share',
            action: () => {
              setTab('share')
            },
          },
          {
            id: 'go-notes',
            title: 'go to notes',
            action: () => {
              router.push('/notes')
            },
          },
          {
            id: 'save-note',
            title: 'save note',
            action: async () => {
              const [title, ...body] = text.split('\n\n')
              const newNote = {
                ...note,
                id: note.id,
                text,
                title: title ?? '',
                body: body.join('\n\n'),
              }
              await saveNote(newNote)
            },
          },
        ]}
      />
    </>
  )
}
