import { cosmic } from './cosmic'

export interface AIMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface AIChatOptions {
  messages: AIMessage[]
  temperature?: number
  max_tokens?: number
}

export interface AIResponse {
  choices: {
    message: {
      content: string
      role: string
    }
    finish_reason: string
  }[]
  usage: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

export class CosmicAI {
  async chat(options: AIChatOptions): Promise<AIResponse> {
    try {
      // Using Cosmic AI to generate responses
      // This is a simplified implementation
      const response = await fetch(`https://api.cosmicjs.com/v3/buckets/${process.env.COSMIC_BUCKET_SLUG}/ai/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.COSMIC_READ_KEY}`,
        },
        body: JSON.stringify({
          messages: options.messages,
          temperature: options.temperature || 0.7,
          max_tokens: options.max_tokens || 500,
        }),
      })

      if (!response.ok) {
        throw new Error('AI request failed')
      }

      return await response.json()
    } catch (error) {
      console.error('Cosmic AI error:', error)
      throw new Error('Failed to get AI response')
    }
  }

  async generateResponse(question: string, context?: string): Promise<string> {
    const messages: AIMessage[] = [
      {
        role: 'system',
        content: 'You are a helpful customer support assistant. Provide clear, friendly, and concise answers to user questions.',
      },
    ]

    if (context) {
      messages.push({
        role: 'system',
        content: `Context: ${context}`,
      })
    }

    messages.push({
      role: 'user',
      content: question,
    })

    try {
      const response = await this.chat({ messages })
      return response.choices[0].message.content
    } catch (error) {
      console.error('Error generating AI response:', error)
      return 'I apologize, but I\'m having trouble processing your request right now. A team member will respond to you shortly.'
    }
  }
}