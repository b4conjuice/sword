import { Main } from '@/components/ui'
import Sword from './sword'

export default function Home() {
  return (
    <Main className='flex flex-col p-4'>
      <div className='flex flex-grow flex-col'>
        <Sword />
      </div>
    </Main>
  )
}
