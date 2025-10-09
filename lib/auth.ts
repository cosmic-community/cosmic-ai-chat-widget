import bcrypt from 'bcryptjs'
import { cookies } from 'next/headers'
import { cosmic, hasStatus } from './cosmic'
import { TeamMember } from '@/types'

const SESSION_COOKIE_NAME = 'chat_session'
const SESSION_MAX_AGE = 60 * 60 * 24 * 7 // 7 days

export async function verifyCredentials(email: string, password: string): Promise<TeamMember | null> {
  try {
    const response = await cosmic.objects
      .find({
        type: 'team_members',
        'metadata.email': email,
      })
      .props(['id', 'title', 'slug', 'metadata'])

    if (!response.objects || response.objects.length === 0) {
      return null
    }

    const teamMember = response.objects[0] as TeamMember

    // Verify password
    const isValid = await bcrypt.compare(password, teamMember.metadata.password_hash)
    
    if (!isValid) {
      return null
    }

    // Update last login
    await cosmic.objects.updateOne(teamMember.id, {
      metadata: {
        last_login: new Date().toISOString(),
      },
    })

    return teamMember
  } catch (error) {
    if (hasStatus(error) && error.status === 404) {
      return null
    }
    throw new Error('Authentication error')
  }
}

export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 10)
}

export async function createSession(teamMember: TeamMember): Promise<void> {
  const sessionData = {
    id: teamMember.id,
    email: teamMember.metadata.email,
    name: teamMember.metadata.full_name,
    role: teamMember.metadata.role,
  }

  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE_NAME, JSON.stringify(sessionData), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_MAX_AGE,
    path: '/',
  })
}

export async function getSession(): Promise<{
  id: string
  email: string
  name: string
  role: string
} | null> {
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)
    
    if (!sessionCookie?.value) {
      return null
    }

    return JSON.parse(sessionCookie.value)
  } catch (error) {
    return null
  }
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE_NAME)
}