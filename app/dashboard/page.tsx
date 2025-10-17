import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import DashboardHeader from '@/components/DashboardHeader'
import ConversationList from '@/components/ConversationList'
import ContextUrlManager from '@/components/ContextUrlManager'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/dashboard/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader user={session.user} />
      
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-2">Conversations</h1>
              <p className="text-gray-600">Manage and respond to visitor messages</p>
            </div>
            <ConversationList />
          </div>
          
          <div>
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-2">AI Context URLs</h2>
              <p className="text-gray-600">Add URLs for AI to reference</p>
            </div>
            <ContextUrlManager />
          </div>
        </div>
      </div>
    </div>
  )
}