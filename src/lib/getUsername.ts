import { auth, clerkClient } from '@clerk/nextjs/server'

export default async function getUsername() {
  const { userId } = await auth()
  const client = await clerkClient()
  const user = userId ? await client.users?.getUser(userId) : null
  return user?.username
}
