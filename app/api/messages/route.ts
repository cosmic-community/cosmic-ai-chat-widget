import { NextResponse } from 'next/server'
import { cosmic, hasStatus } from '@/lib/cosmic'
import { Message } from '@/types'
import { CosmicAI } from '@/lib/cosmic-ai'
import { sendNewMessageNotification } from '@/lib/email'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const conversationId = searchParams.get('conversationId')

    if (!conversationId) {
      return NextResponse.json({ error: 'Conversation ID required' }, { status: 400 })
    }

    const response = await cosmic.objects
      .find({
        type: 'messages',
        'metadata.conversation_id': conversationId,
      })
      .props(['id', 'title', 'slug', 'metadata', 'created_at'])
      .depth(1)

    const messages = (response.objects as Message[]).sort((a, b) => {
      const dateA = new Date(a.metadata?.timestamp || a.created_at).getTime()
      const dateB = new Date(b.metadata?.timestamp || b.created_at).getTime()
      return dateA - dateB
    })

    return NextResponse.json({ messages })
  } catch (error) {
    if (hasStatus(error) && error.status === 404) {
      return NextResponse.json({ messages: [] })
    }
    console.error('Error fetching messages:', error)
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { conversationId, content, visitorName, visitorEmail, sendAIResponse } = body

    if (!conversationId || !content) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Create the user message
    const messageResponse = await cosmic.objects.insertOne({
      type: 'messages',
      title: `Message ${Date.now()}`,
      metadata: {
        conversation_id: conversationId,
        content: content,
        sender_type: 'visitor',
        sender_name: visitorName || '',
        timestamp: new Date().toISOString(),
      }
    })

    const message = messageResponse.object as Message

    // Update conversation
    await cosmic.objects.updateOne(conversationId, {
      metadata: {
        last_message: content,
        last_message_at: new Date().toISOString(),
      }
    })

    // Send email notification
    await sendNewMessageNotification(message, conversationId, visitorEmail, visitorName)

    // Generate AI response if enabled
    let aiMessage = null
    if (sendAIResponse) {
        try {
          const ai = new CosmicAI()
          const aiResponse = await ai.generateResponse(content)
        const aiMessageResponse = await cosmic.objects.insertOne({
          type: 'messages',
          title: `AI Response ${Date.now()}`,
          metadata: {
            conversation_id: conversationId,
            content: aiResponse,
            sender_type: 'ai',
            ai_response: true,
            timestamp: new Date().toISOString(),
          }
        })

        aiMessage = aiMessageResponse.object as Message

        // Update conversation with AI response
        await cosmic.objects.updateOne(conversationId, {
          metadata: {
            last_message: aiResponse,
            last_message_at: new Date().toISOString(),
          }
        })
      } catch (error) {
        console.error('Error generating AI response:', error)
      }
    }

    return NextResponse.json({ message, aiMessage })
  } catch (error) {
    console.error('Error creating message:', error)
    return NextResponse.json({ error: 'Failed to create message' }, { status: 500 })
  }
}