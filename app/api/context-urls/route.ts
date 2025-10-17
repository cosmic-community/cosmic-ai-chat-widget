import { NextRequest, NextResponse } from 'next/server'
import { cosmic } from '@/lib/cosmic'
import { ContextUrl } from '@/types'

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

    const response = await cosmic.objects.insertOne({
      title,
      type: 'context-urls',
      metadata: {
        url,
        summary: '', // Will be populated by a background process
        content: 'test', // Changed: Use empty string instead of null for textarea field
        last_fetched: '',
        is_active: true
      }
    })

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