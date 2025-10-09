import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-accent/5 to-background">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Cosmic AI Chat Widget
          </h1>
          
          <p className="text-xl text-gray-600 mb-12">
            Add intelligent AI-powered chat to any website with a single line of code
          </p>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <div className="text-4xl mb-4">🤖</div>
              <h3 className="text-xl font-semibold mb-2">AI-Powered</h3>
              <p className="text-gray-600">Intelligent responses using Cosmic AI technology</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <div className="text-4xl mb-4">📧</div>
              <h3 className="text-xl font-semibold mb-2">Email Alerts</h3>
              <p className="text-gray-600">Instant notifications via Resend integration</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <div className="text-4xl mb-4">🔐</div>
              <h3 className="text-xl font-semibold mb-2">Team Dashboard</h3>
              <p className="text-gray-600">Secure portal for managing conversations</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/dashboard"
              className="bg-primary hover:bg-primary-hover text-primary-foreground px-8 py-4 rounded-lg font-semibold transition-colors inline-block"
            >
              Access Dashboard
            </Link>
            
            <Link
              href="/demo"
              className="bg-secondary hover:bg-gray-200 text-secondary-foreground px-8 py-4 rounded-lg font-semibold transition-colors inline-block"
            >
              View Demo
            </Link>
          </div>

          <div className="mt-16 bg-white p-8 rounded-lg shadow-lg text-left">
            <h2 className="text-2xl font-bold mb-4">Quick Integration</h2>
            <p className="text-gray-600 mb-4">Add this code to any website:</p>
            <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
{`<script>
  (function() {
    var script = document.createElement('script');
    script.src = 'https://your-domain.com/widget.js';
    script.setAttribute('data-cosmic-widget', 'YOUR_WIDGET_ID');
    document.body.appendChild(script);
  })();
</script>`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  )
}