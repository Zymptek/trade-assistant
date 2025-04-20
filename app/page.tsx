import { ClientChatWrapper } from '@/components/client-chat-wrapper'
import { getCurrentUser } from '@/lib/auth/session'
import { getModels } from '@/lib/config/models'
import { generateId } from 'ai'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function Page() {
  // Check if the user is authenticated
  const user = await getCurrentUser()
  if (!user) {
    redirect('/login')
  }
  
  // Only render chat if user is authenticated (profile check handled by middleware)
  const id = generateId()
  const models = await getModels()
  
  return <ClientChatWrapper id={id} models={models} />
}
