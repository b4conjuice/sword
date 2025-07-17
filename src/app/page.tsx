import Link from 'next/link'
import { SignedIn } from '@clerk/nextjs'
import {
  ArrowDownOnSquareIcon,
  ChevronLeftIcon,
} from '@heroicons/react/20/solid'

import Sword from './sword'
import { Main } from '@/components/ui'
import TopNav from '@/components/top-nav'
import HomePageNote from './homepage-note'

export default function Home() {
  return (
    <>
      <TopNav />
      <Main className='flex flex-col'>
        <div className='flex flex-grow flex-col'>
          <HomePageNote />
          {/* <Sword /> */}
        </div>
      </Main>
      {/* <SignedIn>
        <footer className='flex items-center justify-between bg-cb-dusty-blue px-2 pb-4 pt-2'>
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
              // onClick={async () => {
              //   //
              // }}
            >
              <ArrowDownOnSquareIcon className='h-6 w-6' />
            </button>
          </div>
        </footer>
      </SignedIn> */}
    </>
  )
}
