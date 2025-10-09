// app/api/conversations/[id]/route.ts
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { cosmic, hasStatus } from '@/lib/cosmic'
import { Conversation } from '@/types'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const response = await cosmic.objects.findOne({
      type: 'conversations',
      id: id,
    }).props(['id', 'title', 'slug', 'metadata', 'created_at']).depth(1)

    const conversation = response.object as Conversation

    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
    }

    return NextResponse.json({ conversation })
  } catch (error) {
    if (hasStatus(error) && error.status === 404) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
    }
    console.error('Error fetching conversation:', error)
    return NextResponse.json({ error: 'Failed to fetch conversation' }, { status: 500 })
  }
}