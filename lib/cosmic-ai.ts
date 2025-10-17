import { cosmic } from './cosmic'
import { TextStreamingResponse } from '@cosmicjs/sdk'
import { ContextUrl } from '@/types'

export interface AIMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface AIChatOptions {
  messages: AIMessage[]
  max_tokens?: number
  stream?: boolean
}

export interface AIResponse {
  text: string
  usage: {
    input_tokens: number
    output_tokens: number
  }
}

export class CosmicAI {
  // Fetch relevant context URLs based on the question
  async getRelevantContext(question: string): Promise<string> {
    try {
      // Fetch all active context URLs
      const response = await cosmic.objects
        .find({
          type: 'context_urls',
          'metadata.is_active': true
        })
        .props(['id', 'title', 'metadata'])
        .depth(1)

      const contextUrls = response.objects as ContextUrl[]

      if (!contextUrls || contextUrls.length === 0) {
        return ''
      }

      // Use AI to determine which URLs are relevant
      const summaries = contextUrls.map((url, index) => 
        `[${index}] ${url.title}: ${url.metadata.summary}`
      ).join('\n')

      const relevanceCheck = await this.chat({
        messages: [
          {
            role: 'user',
            content: `Given this user question: "${question}"
            
And these available context sources:
${summaries}

Reply with ONLY the numbers (comma-separated) of relevant sources, or "NONE" if none are relevant. Example: "0,2" or "NONE"`
          }
        ],
        max_tokens: 50
      }) as AIResponse

      const relevantIndices = relevanceCheck.text.trim().toUpperCase() === 'NONE' 
        ? [] 
        : relevanceCheck.text.split(',').map(n => parseInt(n.trim())).filter(n => !isNaN(n))

      if (relevantIndices.length === 0) {
        return ''
      }

      // Fetch full content for relevant URLs
      const relevantUrls = relevantIndices
        .filter(i => i >= 0 && i < contextUrls.length)
        .map(i => contextUrls[i])

      const contextParts = await Promise.all(
        relevantUrls.map(async (url) => {
          // If content is not cached, fetch it
          let content = url.metadata.content || ''
          
          if (!content && url.metadata.url) {
            try {
              const fetchResponse = await fetch(url.metadata.url)
              const html = await fetchResponse.text()
              // Extract text content (simple approach)
              content = html
                .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
                .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
                .replace(/<[^>]+>/g, ' ')
                .replace(/\s+/g, ' ')
                .trim()
                .slice(0, 5000) // Limit content length

              // Cache the content
              await cosmic.objects.updateOne(url.id, {
                metadata: {
                  content,
                  last_fetched: new Date().toISOString()
                }
              })
            } catch (error) {
              console.error(`Error fetching content for ${url.metadata.url}:`, error)
              content = url.metadata.summary
            }
          }

          return `Source: ${url.title}\nURL: ${url.metadata.url}\n\n${content}`
        })
      )

      return contextParts.join('\n\n---\n\n')
    } catch (error) {
      console.error('Error getting relevant context:', error)
      return ''
    }
  }

  async chat(options: AIChatOptions): Promise<AIResponse | TextStreamingResponse> {
    try {
      // Using Cosmic AI to generate responses with the official SDK
      const response = await cosmic.ai.generateText({
        messages: options.messages.map(msg => ({
          role: msg.role,
          content: msg.content
        })),
        max_tokens: options.max_tokens || 500,
        stream: options.stream || false
      })

      // If streaming is enabled, return the stream
      if (options.stream) {
        return response as TextStreamingResponse
      }

      // Otherwise return the complete response
      return response as AIResponse
    } catch (error) {
      console.error('Cosmic AI error:', error)
      throw new Error('Failed to get AI response')
    }
  }

  async generateResponse(question: string, context?: string): Promise<string> {
    const messages: AIMessage[] = [
      {
        role: 'user',
        content: context 
          ? `Context: ${context}\n\nQuestion: ${question}`
          : question
      }
    ]

    try {
      const response = await this.chat({ messages }) as AIResponse
      return response.text
    } catch (error) {
      console.error('Error generating AI response:', error)
      return 'I apologize, but I\'m having trouble processing your request right now. A team member will respond to you shortly.'
    }
  }

  async streamResponse(question: string): Promise<TextStreamingResponse> {
    // Get relevant context first
    const context = await this.getRelevantContext(question)
    
    const messages: AIMessage[] = [
      {
        role: 'user',
        content: context 
          ? `You are a helpful assistant. Use the following context information to answer the user's question accurately. If the context doesn't contain relevant information, answer based on your general knowledge but mention that you're not using specific context.

Context Information:
${context}

User Question: ${question}`
          : question
      }
    ]

    try {
      const stream = await this.chat({ 
        messages, 
        stream: true,
        max_tokens: 1000
      }) as TextStreamingResponse
      
      return stream
    } catch (error) {
      console.error('Error streaming AI response:', error)
      throw error
    }
  }
}