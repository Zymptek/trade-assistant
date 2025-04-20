import { ClientChatWrapper } from '@/components/client-chat-wrapper'
import { getChat } from '@/lib/actions/chat'
import { getCurrentUser } from '@/lib/auth/session'
import { getModels } from '@/lib/config/models'
import { convertToUIMessages } from '@/lib/utils'
import { notFound, redirect } from 'next/navigation'

export const maxDuration = 60
export const dynamic = 'force-dynamic'

export async function generateMetadata(props: {
  params: Promise<{ id: string }>
}) {
  const { id } = await props.params
  const chat = await getChat(id, 'anonymous')
  return {
    title: chat?.title.toString().slice(0, 50) || 'Search'
  }
}

export default async function SearchPage(props: {
  params: Promise<{ id: string }>
}) {
  // Check if the user is authenticated
  const user = await getCurrentUser()
  if (!user) {
    redirect('/login')
  }
  
  const userId = user.id
  const { id } = await props.params

  const chat = await getChat(id, userId)
  // convertToUIMessages for useChat hook
  const messages = convertToUIMessages(chat?.messages || [])

  if (!chat) {
    redirect('/')
  }

  if (chat?.userId !== userId && chat?.userId !== 'anonymous') {
    notFound()
  }

  const models = await getModels()
  return <ClientChatWrapper id={id} savedMessages={messages} models={models} />
}
