'use client'

import { useState, useEffect, useRef } from 'react'
import ReactMarkdown from 'react-markdown'
import { ChatMessage } from '@/types'
export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputValue, setInputValue] = useState('')
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [visitorName, setVisitorName] = useState('')
  const [visitorEmail, setVisitorEmail] = useState('')
  const [showNamePrompt, setShowNamePrompt] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const initializeChat = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/widget/init', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          visitorEmail,
          visitorName,
          websiteUrl: window.location.href,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to initialize chat')
      }

      const data = await response.json()
      setConversationId(data.conversationId)
      setShowNamePrompt(false)

      // Add welcome message
      setMessages([
        {
          id: '1',
          content: `Hi ${visitorName || 'there'}! 👋 How can I help you today?`,
          sender: 'bot',
          timestamp: new Date().toISOString(),
        }
      ])
    } catch (error) {
      console.error('Error initializing chat:', error)
      // Show error message to user
      setMessages([
        {
          id: 'error',
          content: 'Sorry, there was an error starting the chat. Please try again.',
          sender: 'bot',
          timestamp: new Date().toISOString(),
        }
      ])
      setShowNamePrompt(true) // Keep the name prompt visible
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Handle name prompt submission
    if (showNamePrompt) {
      if (!visitorName.trim()) {
        return // Require at least a name
      }
      await initializeChat()
      return
    }

    // Handle regular message submission
    if (!inputValue.trim()) return

    if (!conversationId) return

    // Store the message content before clearing input
    const messageContent = inputValue

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: messageContent,
      sender: 'user',
      timestamp: new Date().toISOString(),
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsLoading(true)

    try {
      // Save the user message first
      await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId,
          content: messageContent,
          visitorName,
          visitorEmail,
          sendAIResponse: false, // Don't generate AI response here
        }),
      })

      // Create a placeholder for the AI response
      const aiMessageId = `ai-${Date.now()}`
      const aiPlaceholder: ChatMessage = {
        id: aiMessageId,
        content: '',
        sender: 'bot',
        timestamp: new Date().toISOString(),
      }
      setMessages(prev => [...prev, aiPlaceholder])

      // Now stream the AI response
      const streamResponse = await fetch('/api/messages/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId,
          content: messageContent,
        }),
      })

      if (!streamResponse.ok) {
        throw new Error('Failed to get AI response')
      }

      const reader = streamResponse.body?.getReader()
      const decoder = new TextDecoder()
      let accumulatedText = ''

      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value, { stream: true })
          const lines = chunk.split('\n')

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6))
                
                if (data.text) {
                  accumulatedText += data.text
                  // Update the AI message with accumulated text
                  setMessages(prev => 
                    prev.map(msg => 
                      msg.id === aiMessageId 
                        ? { ...msg, content: accumulatedText }
                        : msg
                    )
                  )
                }

                if (data.done && data.messageId) {
                  // Update with the final message ID from the server
                  setMessages(prev => 
                    prev.map(msg => 
                      msg.id === aiMessageId 
                        ? { ...msg, id: data.messageId }
                        : msg
                    )
                  )
                }
              } catch (e) {
                // Ignore JSON parse errors for incomplete chunks
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Error sending message:', error)
      // Remove the placeholder on error
      setMessages(prev => prev.filter(msg => !msg.id.startsWith('ai-')))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      {/* Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 bg-primary hover:bg-primary-hover text-primary-foreground w-16 h-16 rounded-full shadow-lg flex items-center justify-center transition-transform hover:scale-110 z-50"
          aria-label="Open chat"
        >
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 h-[600px] bg-white rounded-lg shadow-2xl flex flex-col z-50 animate-slide-up">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary to-accent text-white p-4 rounded-t-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold">Chat with us</h3>
                <p className="text-xs opacity-90">We typically reply instantly</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-white/20 rounded-full p-1 transition-colors"
              aria-label="Close chat"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {showNamePrompt ? (
              <div className="space-y-4">
                <div className="bg-secondary p-4 rounded-lg">
                  <p className="text-sm text-secondary-foreground mb-4">
                    Welcome! 👋 Please tell us a bit about yourself to get started.
                  </p>
                    <input
                      type="text"
                      value={visitorName}
                      onChange={(e) => setVisitorName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && visitorName.trim()) {
                          e.preventDefault()
                          handleSubmit(e as any)
                        }
                      }}
                      placeholder="Your name"
                      className="w-full px-3 py-2 border border-border rounded-lg mb-2 focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <input
                      type="email"
                      value={visitorEmail}
                      onChange={(e) => setVisitorEmail(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && visitorName.trim()) {
                          e.preventDefault()
                          handleSubmit(e as any)
                        }
                      }}
                      placeholder="Your email (optional)"
                      className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                </div>
              </div>
            ) : (
              <>
                {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] p-3 rounded-lg ${
                          message.sender === 'user'
                            ? 'chat-message-user'
                            : 'chat-message-bot'
                        }`}
                      >
                        {message.sender === 'bot' ? (
                          <div className="text-sm prose prose-sm max-w-none">
                            <ReactMarkdown>{message.content}</ReactMarkdown>
                          </div>
                        ) : (
                          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                        )}
                      </div>
                    </div>
                  ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="chat-message-bot max-w-[80%] p-3 rounded-lg">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit} className="p-4 border-t border-border">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={showNamePrompt ? "Fill in your details above, then click Start Chat" : "Type your message..."}
                className="flex-1 px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                disabled={isLoading || showNamePrompt}
              />
              <button
                type="submit"
                disabled={isLoading || (showNamePrompt ? !visitorName.trim() : !inputValue.trim())}
                className={`bg-primary hover:bg-primary-hover text-primary-foreground rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${showNamePrompt ? 'px-6 py-2' : 'px-4 py-2'}`}
              >
                {showNamePrompt ? (
                  'Start Chat'
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  )
}