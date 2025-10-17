// app/dashboard/conversations/[id]/page.tsx
import DashboardHeader from '@/components/DashboardHeader'
import ConversationDetail from '@/components/ConversationDetail'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function ConversationPage({ params }: PageProps) {
  const { id } = await params

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />
      
      <div className="container mx-auto px-4 py-8">
        <ConversationDetail conversationId={id} />
      </div>
    </div>
  )
}