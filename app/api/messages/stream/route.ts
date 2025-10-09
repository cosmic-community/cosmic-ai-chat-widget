import { cosmic } from '@/lib/cosmic'
import { CosmicAI } from '@/lib/cosmic-ai'
import { TextStreamingResponse } from '@cosmicjs/sdk'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { conversationId, content } = body

    if (!conversationId || !content) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Create the AI instance
    const ai = new CosmicAI()

    // Get the streaming response
    const stream = await ai.streamResponse(content)

    // Create a readable stream for the response
    const encoder = new TextEncoder()
    let fullResponse = ''

    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          // Handle the stream using event-based approach
          stream.on('text', (text: string) => {
            fullResponse += text
            // Send the text chunk to the client
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`))
          })

          stream.on('end', async () => {
            try {
              // Save the complete AI response to Cosmic
              const aiMessageResponse = await cosmic.objects.insertOne({
                type: 'messages',
                title: `AI Response ${Date.now()}`,
                metadata: {
                  conversation_id: conversationId,
                  content: fullResponse,
                  sender_type: 'ai',
                  ai_response: true,
                  timestamp: new Date().toISOString(),
                }
              })

              // Update conversation with AI response
              await cosmic.objects.updateOne(conversationId, {
                metadata: {
                  last_message: fullResponse,
                  last_message_at: new Date().toISOString(),
                }
              })

              // Send completion signal with message ID
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ 
                  done: true, 
                  messageId: aiMessageResponse.object.id 
                })}\n\n`)
              )
              controller.close()
            } catch (error) {
              console.error('Error saving AI response:', error)
              controller.error(error)
            }
          })

          stream.on('error', (error: Error) => {
            console.error('Stream error:', error)
            controller.error(error)
          })
        } catch (error) {
          console.error('Error starting stream:', error)
          controller.error(error)
        }
      }
    })

    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })
  } catch (error) {
    console.error('Error in stream endpoint:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to stream response' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}