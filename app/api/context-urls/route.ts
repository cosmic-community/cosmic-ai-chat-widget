import { NextRequest, NextResponse } from 'next/server'
import { cosmic } from '@/lib/cosmic'
import { ContextUrl } from '@/types'
import { CosmicAI } from '@/lib/cosmic-ai'

export async function GET() {
  try {
    const response = await cosmic.objects
      .find({ type: 'context-urls' })
      .props(['id', 'title', 'slug', 'metadata'])
      .depth(1)

    return NextResponse.json({
      contextUrls: response.objects as ContextUrl[]
    })
  } catch (error) {
    console.error('Error fetching context URLs:', error)
    return NextResponse.json(
      { error: 'Failed to fetch context URLs' },
      { status: 500 }
    )
  }
}

// Helper function to scrape content from a URL
async function scrapeUrlContent(url: string): Promise<string> {
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

// Helper function to generate AI summary
async function generateSummary(content: string, url: string): Promise<string> {
  try {
    const ai = new CosmicAI()
    
    const summary = await ai.generateResponse(
      `Please provide a comprehensive summary of the following content from ${url}. 
      Focus on the main topics, key information, and what this content covers. 
      Keep the summary informative but concise (2-3 sentences):

      ${content}`
    )
    
    return summary
  } catch (error) {
    console.error('Error generating AI summary:', error)
    return 'Content available for context - summary generation failed'
  }
}

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json()

    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      )
    }

    // Validate URL format
    try {
      new URL(url)
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      )
    }

    // Create a simple title from the URL
    const urlObj = new URL(url)
    const title = `${urlObj.hostname}${urlObj.pathname}`

    console.log(`Processing new context URL: ${url}`)

    // Initialize variables for content and summary
    let content = ''
    let summary = ''
    let lastFetched = ''

    try {
      // Step 1: Scrape the content from the URL
      console.log(`Scraping content from: ${url}`)
      content = await scrapeUrlContent(url)
      console.log(`Successfully scraped content (${content.length} characters)`)

      // Step 2: Generate AI summary of the content
      console.log(`Generating AI summary for: ${url}`)
      summary = await generateSummary(content, url)
      console.log(`Successfully generated summary: ${summary.substring(0, 100)}...`)

      lastFetched = new Date().toISOString()
    } catch (error) {
      console.error(`Failed to process content for ${url}:`, error)
      // Continue with creating the object even if content fetching fails
      summary = 'Content fetching failed - will retry automatically'
    }

    // Create the context URL object with fetched content and AI summary
    const response = await cosmic.objects.insertOne({
      title,
      type: 'context-urls',
      metadata: {
        url,
        summary,
        content,
        last_fetched: lastFetched,
        is_active: true
      }
    })

    console.log(`Successfully created context URL object for: ${url}`)

    return NextResponse.json({
      contextUrl: response.object as ContextUrl
    })
  } catch (error) {
    console.error('Error creating context URL:', error)
    return NextResponse.json(
      { error: 'Failed to create context URL' },
      { status: 500 }
    )
  }
}