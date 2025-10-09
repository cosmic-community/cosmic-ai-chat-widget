// app/dashboard/conversations/[id]/page.tsx
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import DashboardHeader from '@/components/DashboardHeader'
import ConversationDetail from '@/components/ConversationDetail'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function ConversationPage({ params }: PageProps) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/dashboard/login')
  }

  const { id } = await params

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader user={session.user} />
      
      <div className="container mx-auto px-4 py-8">
        <ConversationDetail conversationId={id} />
      </div>
    </div>
  )
}