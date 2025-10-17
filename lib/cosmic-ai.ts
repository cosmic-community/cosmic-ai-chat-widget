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
  // Scrape content from a URL
  private async scrapeUrlContent(url: string): Promise<string> {
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; CosmicAI-Bot/1.0)'
        }
      })
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const html = await response.text()
      
      // Enhanced content extraction
      let content = html
        // Remove script tags and their content
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        // Remove style tags and their content
        .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
        // Remove HTML comments
        .replace(/<!--[\s\S]*?-->/g, '')
        // Remove HTML tags but keep their content
        .replace(/<[^>]+>/g, ' ')
        // Normalize whitespace
        .replace(/\s+/g, ' ')
        // Remove extra line breaks
        .replace(/\n\s*\n/g, '\n')
        .trim()
      
      // Limit content length to prevent token overflow
      if (content.length > 10000) {
        content = content.slice(0, 10000) + '... [content truncated]'
      }
      
      return content
    } catch (error) {
      console.error(`Error scraping URL ${url}:`, error)
      throw error
    }
  }

  // Enhanced context fetching with full content scraping
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

      // Step 1: Use AI to determine which URLs are relevant and if full content is needed
      const summaries = contextUrls.map((url, index) => 
        `[${index}] ${url.title}: ${url.metadata.summary}`
      ).join('\n')

      const contextAnalysis = await this.chat({
        messages: [
          {
            role: 'user',
            content: `Given this user question: "${question}"

And these available context sources:
${summaries}

Analyze the question and respond with JSON in this format:
{
  "relevant_indices": [0, 1, 2],
  "needs_full_content": true,
  "reasoning": "The user is asking for specific content that requires accessing the full page content, not just summaries."
}

- relevant_indices: Array of numbers for relevant sources (empty array if none)
- needs_full_content: true if the question asks for specific content, quotes, sections, or details that would require scraping the full page content
- reasoning: Brief explanation of your decision

Examples of questions that need full content:
- "What text do you see under Getting started?"
- "What are the exact steps in the tutorial?"
- "Can you quote the documentation about API keys?"
- "What's written in the troubleshooting section?"

Examples of questions that don't need full content:
- "What is Cosmic CMS?"
- "Do you have documentation?"
- "What topics are covered in your docs?"`
          }
        ],
        max_tokens: 200
      }) as AIResponse

      let analysis
      try {
        analysis = JSON.parse(contextAnalysis.text.trim())
      } catch (e) {
        // Fallback if JSON parsing fails
        console.error('Error parsing context analysis:', e)
        analysis = { relevant_indices: [], needs_full_content: false, reasoning: 'Parse error' }
      }

      const relevantIndices = Array.isArray(analysis.relevant_indices) ? analysis.relevant_indices : []
      const needsFullContent = analysis.needs_full_content === true

      if (relevantIndices.length === 0) {
        return ''
      }

      // Filter to valid indices
      const relevantUrls = relevantIndices
        .filter(i => i >= 0 && i < contextUrls.length)
        .map(i => contextUrls[i])

      if (relevantUrls.length === 0) {
        return ''
      }

      // Step 2: Get context content (cached summary or full scraped content)
      const contextParts = await Promise.all(
        relevantUrls.map(async (url) => {
          if (!url) {
            return ''
          }
          
          let content = ''
          
          // If we need full content and don't have cached content, scrape the URL
          if (needsFullContent && !url.metadata.content) {
            try {
              console.log(`Scraping full content for: ${url.metadata.url}`)
              content = await this.scrapeUrlContent(url.metadata.url)
              
              // Cache the scraped content
              await cosmic.objects.updateOne(url.id, {
                metadata: {
                  content,
                  last_fetched: new Date().toISOString()
                }
              })
              
              console.log(`Successfully scraped and cached content for: ${url.metadata.url}`)
            } catch (error) {
              console.error(`Failed to scrape ${url.metadata.url}:`, error)
              // Fall back to cached content or summary
              content = url.metadata.content || url.metadata.summary
            }
          } else {
            // Use cached content if available, otherwise use summary
            content = url.metadata.content || url.metadata.summary
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
    // Get enhanced context if not provided
    const finalContext = context || await this.getRelevantContext(question)
    
    const messages: AIMessage[] = [
      {
        role: 'user',
        content: finalContext 
          ? `You are a helpful assistant with access to specific context information. Use this context to answer the user's question accurately and in detail. If the user asks for specific content, sections, or quotes, provide them exactly as they appear in the context.

Context Information:
${finalContext}

User Question: ${question}

Instructions:
- If the context contains the specific information requested, provide it directly
- If asking for text from specific sections, quote it exactly
- If the context doesn't contain the requested information, clearly state that
- Be helpful and detailed in your responses`
          : question
      }
    ]

    try {
      const response = await this.chat({ messages, max_tokens: 1000 }) as AIResponse
      return response.text
    } catch (error) {
      console.error('Error generating AI response:', error)
      return 'I apologize, but I\'m having trouble processing your request right now. A team member will respond to you shortly.'
    }
  }

  async streamResponse(question: string): Promise<TextStreamingResponse> {
    // Get relevant context first with enhanced scraping
    const context = await this.getRelevantContext(question)
    
    const messages: AIMessage[] = [
      {
        role: 'user',
        content: context 
          ? `You are a helpful assistant with access to specific context information. Use this context to answer the user's question accurately and in detail. If the user asks for specific content, sections, or quotes, provide them exactly as they appear in the context.

Context Information:
${context}

User Question: ${question}

Instructions:
- If the context contains the specific information requested, provide it directly
- If asking for text from specific sections, quote it exactly
- If the context doesn't contain the requested information, clearly state that
- Be helpful and detailed in your responses`
          : question
      }
    ]

    try {
      const stream = await this.chat({ 
        messages, 
        stream: true,
        max_tokens: 1500
      }) as TextStreamingResponse
      
      return stream
    } catch (error) {
      console.error('Error streaming AI response:', error)
      throw error
    }
  }
}