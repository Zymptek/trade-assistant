'use client'

import { Model } from '@/lib/types/models'
import { Message } from 'ai/react'
import dynamic from 'next/dynamic'
import { Suspense } from 'react'
import { Spinner } from './ui/spinner'

// Simplified dynamic import - more stable for HMR
const Chat = dynamic(() => import('./chat').then(mod => ({ default: mod.Chat })), { 
  ssr: false,
  loading: () => <div className="flex justify-center pt-40"><Spinner /></div>
})

interface ClientChatWrapperProps {
  id: string
  savedMessages?: Message[]
  query?: string
  models?: Model[]
}

export function ClientChatWrapper({ id, savedMessages = [], query, models }: ClientChatWrapperProps) {
  return (
    <div className="w-full h-full">
      <Suspense fallback={<div className="flex justify-center pt-40"><Spinner /></div>}>
        <Chat id={id} savedMessages={savedMessages} query={query} models={models} />
      </Suspense>
    </div>
  )
} 