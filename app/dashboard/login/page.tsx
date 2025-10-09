import LoginForm from '@/components/LoginForm'

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-accent/5 to-background flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">Team Dashboard</h1>
          <p className="text-gray-600">Sign in to manage conversations</p>
        </div>

        <LoginForm />
      </div>
    </div>
  )
}