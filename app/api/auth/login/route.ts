import { NextResponse } from 'next/server'
import { verifyCredentials, createSession } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    const teamMember = await verifyCredentials(email, password)

    if (!teamMember) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    await createSession(teamMember)

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
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    )
  }
}