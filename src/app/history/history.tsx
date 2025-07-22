'use client'

import useLocalStorage from '@/lib/useLocalStorage'
import { type HistoryEntry } from '@/lib/types'

export default function History() {
  const [history] = useLocalStorage<HistoryEntry[]>('s4-history', [])
  if (!history || history.length === 0) return <p>no history</p>
  return (
    <ul className='divide-y divide-cb-dusty-blue'>
      {history.map(({ scripture, url }, index) => (
        <li key={index} className='py-4 first:pt-0'>
          <a
            href={url}
            target='_blank'
            className='text-cb-pink hover:text-cb-pink/75'
          >
            {scripture.asString}
          </a>
        </li>
      ))}
    </ul>
  )
}
