'use client'

import { useState, useEffect } from 'react'
import { Conversation } from '@/types'
import { formatDistanceToNow } from 'date-fns'
import Link from 'next/link'

export default function ConversationList() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchConversations()
  }, [])

  const fetchConversations = async () => {
    try {
      setError(null)
      const response = await fetch('/api/conversations')
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      setConversations(data.conversations || [])
    } catch (error) {
      console.error('Error fetching conversations:', error)
      setError('Failed to load conversations. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusValue = (status: any): string => {
    if (typeof status === 'string') return status
    if (status && typeof status === 'object' && status.key) return status.key
    if (status && typeof status === 'object' && status.value) return status.value
    return 'active'
  }

  const getStatusDisplay = (status: any): string => {
    if (typeof status === 'string') return status
    if (status && typeof status === 'object' && status.value) return status.value
    if (status && typeof status === 'object' && status.key) return status.key
    return 'Active'
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-12 text-center">
        <div className="text-6xl mb-4">⚠️</div>
        <h3 className="text-xl font-semibold mb-2 text-red-600">Error Loading Conversations</h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <button
          onClick={fetchConversations}
          className="bg-primary hover:bg-primary/90 text-white px-6 py-2 rounded-md font-medium transition-colors"
        >
          Try Again
        </button>
      </div>
    )
  }

  if (conversations.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-12 text-center">
        <div className="text-6xl mb-4">💬</div>
        <h3 className="text-xl font-semibold mb-2">No conversations yet</h3>
        <p className="text-gray-600">
          Conversations will appear here when visitors start chatting
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="divide-y divide-border">
        {conversations.map((conversation) => (
          <Link
            key={conversation.id}
            href={`/dashboard/conversations/${conversation.id}`}
            className="block p-6 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center text-white font-semibold">
                    {((conversation.metadata?.visitor_name || 'Anonymous')[0] || 'A').toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-semibold">
                      {conversation.metadata?.visitor_name || 'Anonymous Visitor'}
                    </h3>
                    {conversation.metadata?.visitor_email && (
                      <p className="text-sm text-gray-500">
                        {conversation.metadata.visitor_email}
                      </p>
                    )}
                  </div>
                </div>
                
                {conversation.metadata?.last_message && (
                  <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                    {conversation.metadata.last_message}
                  </p>
                )}
                
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span>
                    {formatDistanceToNow(new Date(conversation.metadata?.last_message_at || conversation.created_at), { addSuffix: true })}
                  </span>
                  {conversation.metadata?.website_url && (
                    <span className="flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                      </svg>
                      {(() => {
                        try {
                          return new URL(conversation.metadata.website_url).hostname
                        } catch {
                          return 'Invalid URL'
                        }
                      })()}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex flex-col items-end gap-2">
                <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                  getStatusValue(conversation.metadata?.status).toLowerCase() === 'active' 
                    ? 'bg-accent/10 text-accent'
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {getStatusDisplay(conversation.metadata?.status)}
                </span>
                
                {conversation.metadata?.unread_count && conversation.metadata.unread_count > 0 && (
                  <span className="bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold">
                    {conversation.metadata.unread_count}
                  </span>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}