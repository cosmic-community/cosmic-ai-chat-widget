import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { cosmic, hasStatus } from '@/lib/cosmic'
import { Conversation } from '@/types'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const response = await cosmic.objects
      .find({
        type: 'conversations'
      })
      .props(['id', 'title', 'slug', 'metadata', 'created_at'])
      .depth(1)

    const conversations = (response.objects as Conversation[]).sort((a, b) => {
      const dateA = new Date(a.metadata?.last_message_at || a.created_at).getTime()
      const dateB = new Date(b.metadata?.last_message_at || b.created_at).getTime()
      return dateB - dateA
    })

    return NextResponse.json({ conversations })
  } catch (error) {
    if (hasStatus(error) && error.status === 404) {
      return NextResponse.json({ conversations: [] })
    }
    console.error('Error fetching conversations:', error)
    return NextResponse.json({ error: 'Failed to fetch conversations' }, { status: 500 })
  }
}