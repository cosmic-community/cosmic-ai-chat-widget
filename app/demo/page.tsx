import ChatWidget from '@/components/ChatWidget'

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-4">Chat Widget Demo</h1>
          <p className="text-gray-600 mb-8">
            Try out the chat widget below. Click the chat button in the bottom right corner to start a conversation.
          </p>

          <div className="bg-white p-8 rounded-lg shadow-lg mb-8">
            <h2 className="text-2xl font-semibold mb-4">Sample Website Content</h2>
            <p className="text-gray-700 mb-4">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. 
              Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
            </p>
            <p className="text-gray-700 mb-4">
              Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. 
              Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
            </p>
            <div className="bg-primary/10 p-4 rounded-lg">
              <p className="text-primary font-semibold">
                💬 The chat widget is active on this page! Click the button in the bottom right corner to start chatting.
              </p>
            </div>
          </div>
        </div>
      </div>

      <ChatWidget />
    </div>
  )
}