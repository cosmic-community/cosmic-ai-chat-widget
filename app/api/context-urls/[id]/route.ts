// app/api/context-urls/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { cosmic } from '@/lib/cosmic'

interface RouteParams {
  params: Promise<{
    id: string
  }>
}

export async function PATCH(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params
    const body = await request.json()

    await cosmic.objects.updateOne(id, {
      metadata: body
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating context URL:', error)
    return NextResponse.json(
      { error: 'Failed to update context URL' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params

    await cosmic.objects.deleteOne(id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting context URL:', error)
    return NextResponse.json(
      { error: 'Failed to delete context URL' },
      { status: 500 }
    )
  }
}