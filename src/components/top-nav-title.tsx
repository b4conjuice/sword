'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'

import { Title } from '@/components/ui'
import { DEFAULT_TITLE } from '@/lib/defaults'

export default function TopNavTitle({
  title: initialTitle,
}: {
  title?: string
}) {
  const pathname = usePathname()
  const title = initialTitle ?? DEFAULT_TITLE
  if (pathname === '/') {
    return <Title>{title}</Title>
  }
  return (
    <Link href='/' className='hover:text-cb-pink'>
      <Title>{title}</Title>
    </Link>
  )
}
