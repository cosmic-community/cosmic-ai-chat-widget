import { NextResponse } from 'next/server'
import { cosmic, hasStatus } from '@/lib/cosmic'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { visitorEmail, visitorName, websiteUrl } = body

    // Create a new conversation
    const response = await cosmic.objects.insertOne({
      type: 'conversations',
      title: `Chat ${Date.now()}`,
      metadata: {
        visitor_email: visitorEmail || '',
        visitor_name: visitorName || 'Anonymous',
        website_url: websiteUrl || '',
        status: 'active',
        last_message: '',
        last_message_at: new Date().toISOString(),
        unread_count: 0,
      }
    })

    const conversation = response.object

    return NextResponse.json({ conversationId: conversation.id })
  } catch (error) {
    console.error('Error initializing widget:', error)
    return NextResponse.json({ error: 'Failed to initialize widget' }, { status: 500 })
  }
}