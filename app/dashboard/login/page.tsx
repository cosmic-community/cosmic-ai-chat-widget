import LoginForm from '@/components/LoginForm'

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-accent/5 to-background flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">Team Dashboard</h1>
          <p className="text-gray-600">Sign in to manage conversations</p>
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm">
            <p className="font-semibold text-blue-900 mb-1">Demo Account</p>
            <p className="text-blue-700">Email: <code className="bg-blue-100 px-2 py-1 rounded">admin@example.com</code></p>
            <p className="text-blue-700 text-xs mt-1">Password available in Cosmic team_members object</p>
          </div>
        </div>

        <LoginForm />
      </div>
    </div>
  )
}