'use client'

import { useState, useEffect } from 'react'
import { ContextUrl } from '@/types'

export default function ContextUrlManager() {
  const [contextUrls, setContextUrls] = useState<ContextUrl[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [newUrl, setNewUrl] = useState('')
  const [isAdding, setIsAdding] = useState(false)

  useEffect(() => {
    fetchContextUrls()
  }, [])

  const fetchContextUrls = async () => {
    try {
      const response = await fetch('/api/context-urls')
      if (response.ok) {
        const data = await response.json()
        setContextUrls(data.contextUrls || [])
      }
    } catch (error) {
      console.error('Error fetching context URLs:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddUrl = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newUrl.trim() || isAdding) return

    setIsAdding(true)
    try {
      const response = await fetch('/api/context-urls', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: newUrl.trim() }),
      })

      if (response.ok) {
        const data = await response.json()
        setContextUrls(prev => [data.contextUrl, ...prev])
        setNewUrl('')
      } else {
        console.error('Failed to add context URL')
      }
    } catch (error) {
      console.error('Error adding context URL:', error)
    } finally {
      setIsAdding(false)
    }
  }

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/context-urls/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ is_active: !isActive }),
      })

      if (response.ok) {
        setContextUrls(prev =>
          prev.map(url =>
            url.id === id
              ? { ...url, metadata: { ...url.metadata, is_active: !isActive } }
              : url
          )
        )
      }
    } catch (error) {
      console.error('Error toggling context URL:', error)
    }
  }

  const handleDeleteUrl = async (id: string) => {
    if (!confirm('Are you sure you want to delete this context URL?')) return

    try {
      const response = await fetch(`/api/context-urls/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setContextUrls(prev => prev.filter(url => url.id !== id))
      }
    } catch (error) {
      console.error('Error deleting context URL:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Add new URL form */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4">Add Context URL</h3>
        <form onSubmit={handleAddUrl} className="space-y-4">
          <div>
            <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-2">
              URL
            </label>
            <input
              type="url"
              id="url"
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              placeholder="https://example.com/documentation"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              required
            />
          </div>
          <button
            type="submit"
            disabled={isAdding || !newUrl.trim()}
            className="w-full bg-primary hover:bg-primary/90 disabled:bg-gray-300 text-white px-4 py-2 rounded-md font-medium transition-colors"
          >
            {isAdding ? 'Adding...' : 'Add URL'}
          </button>
        </form>
      </div>

      {/* Context URLs list */}
      <div className="space-y-4">
        {contextUrls.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="text-4xl mb-4">🔗</div>
            <h3 className="text-lg font-semibold mb-2">No context URLs added</h3>
            <p className="text-gray-600">
              Add URLs to provide context for AI responses
            </p>
          </div>
        ) : (
          contextUrls.map((contextUrl) => (
            <div key={contextUrl.id} className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex-shrink-0">
                      <div className={`w-3 h-3 rounded-full ${
                        contextUrl.metadata.is_active ? 'bg-green-500' : 'bg-gray-300'
                      }`} />
                    </div>
                    <h4 className="font-semibold text-gray-900 truncate">
                      {contextUrl.title}
                    </h4>
                  </div>
                  
                  <a
                    href={contextUrl.metadata.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 text-sm break-all"
                  >
                    {contextUrl.metadata.url}
                  </a>
                  
                  {contextUrl.metadata.summary && (
                    <p className="text-gray-600 text-sm mt-2 line-clamp-3">
                      {contextUrl.metadata.summary}
                    </p>
                  )}
                  
                  {contextUrl.metadata.last_fetched && (
                    <p className="text-xs text-gray-500 mt-2">
                      Last updated: {new Date(contextUrl.metadata.last_fetched).toLocaleDateString()}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => handleToggleActive(contextUrl.id, contextUrl.metadata.is_active)}
                    className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                      contextUrl.metadata.is_active
                        ? 'bg-green-100 text-green-800 hover:bg-green-200'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {contextUrl.metadata.is_active ? 'Active' : 'Inactive'}
                  </button>
                  
                  <button
                    onClick={() => handleDeleteUrl(contextUrl.id)}
                    className="text-red-600 hover:text-red-800 p-1"
                    title="Delete URL"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}