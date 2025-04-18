import { createToolCallingStreamResponse } from '@/lib/streaming/create-tool-calling-stream'
import { Model } from '@/lib/types/models'
import { isProviderEnabled } from '@/lib/utils/registry'
import { cookies } from 'next/headers'

export const maxDuration = 30

const DEFAULT_MODEL: Model = {
  "id": "gemini-2.5-pro-preview-03-25",
  "name": "Gemini 2.5 Pro (Preview)",
  "provider": "Google Generative AI",
  "providerId": "google",
  "enabled": true,
  "toolCallType": "native",
  "toolCallModel": 'gemini-2.0-flash'
}

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies()
    const { messages, id: chatId } = await req.json()
    const referer = req.headers.get('referer')
    const isSharePage = referer?.includes('/share/')

    if (isSharePage) {
      return new Response('Chat API is not available on share pages', {
        status: 403,
        statusText: 'Forbidden'
      })
    }

    const modelJson = cookieStore.get('selectedModel')?.value
    const searchMode = true

    let selectedModel = DEFAULT_MODEL

    if (modelJson) {
      try {
        const parsedModel = JSON.parse(modelJson) as Model
        selectedModel = {
          ...parsedModel,
          toolCallType: 'native'
        }
      } catch (e) {
        console.error('Failed to parse selected model:', e)
      }
    }

    if (
      !isProviderEnabled(selectedModel.providerId) ||
      selectedModel.enabled === false
    ) {
      return new Response(
        `Selected provider is not enabled ${selectedModel.providerId}`,
        {
          status: 404,
          statusText: 'Not Found'
        }
      )
    }

    return createToolCallingStreamResponse({
      messages,
      model: selectedModel,
      chatId,
      searchMode
    })
  } catch (error) {
    console.error('API route error:', error)
    return new Response('Error processing your request', {
      status: 500,
      statusText: 'Internal Server Error'
    })
  }
}