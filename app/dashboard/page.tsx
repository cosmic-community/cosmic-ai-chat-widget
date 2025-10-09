import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import DashboardHeader from '@/components/DashboardHeader'
import ConversationList from '@/components/ConversationList'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/dashboard/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader user={session.user} />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Conversations</h1>
          <p className="text-gray-600">Manage and respond to visitor messages</p>
        </div>

        <ConversationList />
      </div>
    </div>
  )
}