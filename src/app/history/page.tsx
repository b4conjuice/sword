import type { Viewport } from 'next'
import Link from 'next/link'
import { ListBulletIcon, PencilSquareIcon } from '@heroicons/react/20/solid'

import { Main } from '@/components/ui'
import TopNav from '@/components/top-nav'
import History from './history'

export const viewport: Viewport = {
  themeColor: '#15232d',
}

export default function HistoryPage() {
  return (
    <>
      <TopNav />
      <Main className='flex flex-col px-4'>
        <div className='flex flex-grow flex-col space-y-4'>
          <History />
        </div>
      </Main>
      <footer className='sticky bottom-0 flex items-center justify-between bg-cb-dusty-blue px-2 pb-6 pt-2'>
        <div className='flex space-x-4'>
          <Link
            className='text-cb-yellow hover:text-cb-yellow/75 disabled:pointer-events-none disabled:opacity-25'
            href='/notes'
          >
            <ListBulletIcon className='h-6 w-6' />
          </Link>
        </div>
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
