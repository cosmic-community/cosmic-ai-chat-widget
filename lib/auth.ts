import bcrypt from 'bcryptjs'
import { cosmic, hasStatus } from './cosmic'
import { TeamMember } from '@/types'

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