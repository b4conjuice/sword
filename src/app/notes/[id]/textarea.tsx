import {
  useState,
  type Dispatch,
  type RefObject,
  type SetStateAction,
  type TextareaHTMLAttributes,
} from 'react'

import useLocalStorage from '@/lib/useLocalStorage'

export default function Textarea({
  textAreaRef,
  text,
  setText,
  // currentSelectionStart,
  setCurrentSelectionStart,
  // currentSelectionEnd,
  setCurrentSelectionEnd,
  textareaProps,
}: {
  textAreaRef: RefObject<HTMLTextAreaElement>
  text: string
  setText: Dispatch<SetStateAction<string>>
  currentSelectionStart: number
  setCurrentSelectionStart: Dispatch<SetStateAction<number>>
  currentSelectionEnd: number
  setCurrentSelectionEnd: Dispatch<SetStateAction<number>>
  textareaProps?: TextareaHTMLAttributes<HTMLTextAreaElement>
}) {
  const [isFullScreen, setIsFullScreen] = useState(false)
  const [commandKey, setCommandKey] = useLocalStorage('n4-commandKey', '!')
  return (
    <textarea
      {...textareaProps}
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
                    idx <= swapIndex - 1 ? total + line.length + 1 : total,
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
    />
  )
}
