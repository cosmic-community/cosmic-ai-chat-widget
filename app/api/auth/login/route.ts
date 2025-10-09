import { NextResponse } from 'next/server'
import { verifyCredentials, createSession } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    console.log('[LOGIN API] Login attempt:', { email, passwordLength: password?.length })

    if (!email || !password) {
      console.log('[LOGIN API] Missing credentials')
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    const teamMember = await verifyCredentials(email, password)

    if (!teamMember) {
      console.log('[LOGIN API] Authentication failed for:', email)
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    await createSession(teamMember)

    console.log('[LOGIN API] Login successful for:', email)

    return NextResponse.json({
      success: true,
      user: {
        id: teamMember.id,
        email: teamMember.metadata.email,
        name: teamMember.metadata.full_name,
        role: teamMember.metadata.role,
      },
    })
  } catch (error) {
    console.error('[LOGIN API] Error:', error)
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    )
  }
}