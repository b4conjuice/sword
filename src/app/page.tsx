import { Main } from '@/components/ui'
import Sword from './sword'
import TopNav from '@/components/top-nav'

export default function Home() {
  return (
    <>
      <TopNav />
      <Main className='flex flex-col p-4'>
        <div className='flex flex-grow flex-col'>
          <Sword />
        </div>
      </Main>
    </>
  )
}
