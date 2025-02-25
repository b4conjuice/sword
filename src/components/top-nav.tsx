import { ArrowRightStartOnRectangleIcon } from '@heroicons/react/20/solid'
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs'

import TopNavTitle from './top-nav-title'
import getUsername from '@/lib/getUsername'

export default async function TopNav({ title }: { title?: string }) {
  const username = await getUsername()
  return (
    <header className='container mx-auto mb-2 flex w-full max-w-screen-md items-center px-2 pt-2 md:px-0'>
      <TopNavTitle title={title} />
      <div className='flex flex-grow justify-end'>
        <SignedOut>
          <SignInButton>
            <ArrowRightStartOnRectangleIcon className='h-6 w-6 hover:cursor-pointer' />
          </SignInButton>
        </SignedOut>
        <SignedIn>
          <div className='flex space-x-2 text-cb-white'>
            {username && <span>{username}</span>}
            <UserButton />
          </div>
        </SignedIn>
      </div>
    </header>
  )
}
