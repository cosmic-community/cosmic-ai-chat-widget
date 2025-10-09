import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { verifyCredentials } from '@/lib/auth'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.log('[NEXTAUTH] Missing credentials')
          return null
        }

        console.log('[NEXTAUTH] Authorize attempt:', { email: credentials.email })

        const teamMember = await verifyCredentials(credentials.email, credentials.password)

        if (!teamMember) {
          console.log('[NEXTAUTH] Authorization failed')
          return null
        }

        console.log('[NEXTAUTH] Authorization successful')

        return {
          id: teamMember.id,
          email: teamMember.metadata.email,
          name: teamMember.metadata.full_name,
          role: teamMember.metadata.role,
        }
      }
    })
  ],
  pages: {
    signIn: '/dashboard/login',
  },
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
      }
      return session
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
}