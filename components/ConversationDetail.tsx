'use client'

import { useState, useEffect, useRef } from 'react'
import { Conversation, Message } from '@/types'
import { formatDistanceToNow } from 'date-fns'
import Link from 'next/link'

interface ConversationDetailProps {
  conversationId: string
}

export default function ConversationDetail({ conversationId }: ConversationDetailProps) {
  const [conversation, setConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [inputValue, setInputValue] = useState('')
  const [isSending, setIsSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchConversation()
    fetchMessages()
  }, [conversationId])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const fetchConversation = async () => {
    try {
      const response = await fetch(`/api/conversations/${conversationId}`)
      const data = await response.json()
      setConversation(data.conversation)
    } catch (error) {
      console.error('Error fetching conversation:', error)
    }
  }

  const fetchMessages = async () => {
    try {
      const response = await fetch(`/api/messages?conversationId=${conversationId}`)
      const data = await response.json()
      setMessages(data.messages || [])
    } catch (error) {
      console.error('Error fetching messages:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!inputValue.trim() || isSending) return

    setIsSending(true)

    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId,
          content: inputValue,
          sendAIResponse: false,
        }),
      })

      const data = await response.json()
      
      if (data.message) {
        setMessages(prev => [...prev, data.message])
        setInputValue('')
      }
    } catch (error) {
      console.error('Error sending message:', error)
    } finally {
      setIsSending(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!conversation) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-12 text-center">
        <h3 className="text-xl font-semibold mb-2">Conversation not found</h3>
        <Link href="/dashboard" className="text-primary hover:underline">
          Back to conversations
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Back Button */}
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to conversations
      </Link>

      {/* Conversation Header */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center text-white font-bold text-xl">
              {(conversation.metadata?.visitor_name || 'A')[0].toUpperCase()}
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-1">
                {conversation.metadata?.visitor_name || 'Anonymous Visitor'}
              </h2>
              {conversation.metadata?.visitor_email && (
                <p className="text-gray-600">{conversation.metadata.visitor_email}</p>
              )}
              <p className="text-sm text-gray-500 mt-1">
                Started {formatDistanceToNow(new Date(conversation.created_at), { addSuffix: true })}
              </p>
            </div>
          </div>

          <span className={`px-4 py-2 text-sm font-medium rounded-full ${
            conversation.metadata?.status === 'active' 
              ? 'bg-accent/10 text-accent'
              : 'bg-gray-100 text-gray-600'
          }`}>
            {conversation.metadata?.status || 'active'}
          </span>
        </div>
      </div>

      {/* Messages */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="h-[500px] overflow-y-auto p-6 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No messages yet
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.metadata?.sender_type === 'visitor' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[70%] p-4 rounded-lg ${
                    message.metadata?.sender_type === 'visitor'
                      ? 'bg-primary text-primary-foreground'
                      : message.metadata?.ai_response
                      ? 'bg-accent/10 text-gray-900 border border-accent/20'
                      : 'bg-secondary text-secondary-foreground'
                  }`}
                >
                  {message.metadata?.sender_type !== 'visitor' && (
                    <p className="text-xs font-semibold mb-1 opacity-70">
                      {message.metadata?.ai_response ? '🤖 AI Assistant' : '👤 Team Member'}
                    </p>
                  )}
                  <p className="whitespace-pre-wrap">{message.metadata?.content}</p>
                  <p className="text-xs opacity-70 mt-2">
                    {formatDistanceToNow(new Date(message.metadata?.timestamp || message.created_at), { addSuffix: true })}
                  </p>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Reply Form */}
        <form onSubmit={handleSendMessage} className="p-6 border-t border-border">
          <div className="flex gap-3">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Type your reply..."
              className="flex-1 px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              disabled={isSending}
            />
            <button
              type="submit"
              disabled={isSending || !inputValue.trim()}
              className="bg-primary hover:bg-primary-hover text-primary-foreground px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSending ? 'Sending...' : 'Send'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}