import { ClientChatWrapper } from '@/components/client-chat-wrapper'
import { getCurrentUser } from '@/lib/auth/session'
import { getModels } from '@/lib/config/models'
import { generateId } from 'ai'
import { redirect } from 'next/navigation'

export const maxDuration = 60
export const dynamic = 'force-dynamic'

export default async function SearchPage(props: {
  searchParams: Promise<{ q: string }>
}) {
  // Check if the user is authenticated
  const user = await getCurrentUser()
  if (!user) {
    redirect('/login')
  }
  
  const { q } = await props.searchParams
  if (!q) {
    redirect('/')
  }

  const id = generateId()
  const models = await getModels()
  return <ClientChatWrapper id={id} query={q} models={models} />
}
