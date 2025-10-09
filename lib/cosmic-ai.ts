import { cosmic } from './cosmic'
import { TextStreamingResponse } from '@cosmicjs/sdk'

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

  async streamResponse(question: string, context?: string): Promise<TextStreamingResponse> {
    const messages: AIMessage[] = [
      {
        role: 'user',
        content: context 
          ? `Context: ${context}\n\nQuestion: ${question}`
          : question
      }
    ]

    try {
      const stream = await this.chat({ 
        messages, 
        stream: true 
      }) as TextStreamingResponse
      
      return stream
    } catch (error) {
      console.error('Error streaming AI response:', error)
      throw error
    }
  }
}