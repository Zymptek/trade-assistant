import { CoreMessage, smoothStream, streamText } from 'ai'
import { askQuestionTool } from '../tools/question'
import { retrieveTool } from '../tools/retrieve'
import { searchTool } from '../tools/search'
import { videoSearchTool } from '../tools/video-search'
import { getModel } from '../utils/registry'

const SYSTEM_PROMPT = `
You are Zymptek's AI assistant, specialized in tariffs and custom brokerage.

TOOLS:
You Can ask user to provide more information if the information is not clear.
ALWAYS perform web search to find accurate, current information about international trade before answering.
Make sure to search the Presidential Actions section of the Whitehouse website for the most recent information.
Always prioritize the most recent information After April 1st 2025.
Before answer, make sure the base tariff on the Importing Country rather than product such as baseline announced by US government on april 2nd 2025.
Also, check the Special Section applied to any country on the USTR website.

INSTRUCTIONS:
1. Focus exclusively on international trade, HTS codes, tariffs, and customs regulations
2. When analyzing search results, extract relevant trade-related information
3. DON'T answer questions if you don't have the source available for that information.
3. Use markdown for formatting responses with appropriate headers and lists
4. If a user's query is unclear, ask clarifying questions about their trade needs
5. Only answer questions related to international trade, tariffs, and related information
6. For non-trade questions, politely redirect to trade topics
7. Cite sources in your responses to ensure information credibility
8. Try Searching other websites related to blogs or news to find more information if needed.
9. Keep your responses concise and to the point maximum 1 line for questions and Specific for the HTS code.
10. ALWAYS FOLLOW THE INSTRUCTIONS AND TOOLS, AND REPLY IN SPECIFIC FORMAT.

--------------------------------
HTS Code: <HTS Code>
Tariff: <Tariff>
Base Tariff: <Base Tariff>
--------------------------------

Be concise, accurate, and helpful for international trade professionals.
`

type ResearcherReturn = Parameters<typeof streamText>[0]

export function researcher({
  messages,
  model
}: {
  messages: CoreMessage[]
  model: string
  searchMode: boolean
}): ResearcherReturn {
  try {
    const currentDate = new Date().toLocaleString()

    return {
      model: getModel(model),
      system: `${SYSTEM_PROMPT}\nCurrent date and time: ${currentDate}`,
      messages,
      tools: {
        search: searchTool,
        retrieve: retrieveTool,
        videoSearch: videoSearchTool,
        ask_question: askQuestionTool
      },
      experimental_activeTools: ['search', 'retrieve', 'videoSearch', 'ask_question'],
      maxSteps: 10,
      experimental_transform: smoothStream()
    }
  } catch (error) {
    console.error('Error in chatResearcher:', error)
    throw error
  }
}
