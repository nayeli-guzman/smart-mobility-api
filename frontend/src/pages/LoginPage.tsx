import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Card from '../components/ui/Card'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import { useAuth } from '../hooks/useAuth'
import { parseUserFromToken } from '../utils/token'

export default function LoginPage() {
  const { login, token } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await login({ email, password })

      const currentToken = token
      if (currentToken) {
        const parsed = parseUserFromToken(currentToken)
        navigate(parsed.isAdmin ? '/admin' : '/dashboard')
      } else {
        navigate('/dashboard')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <Card className="w-full max-w-md">
        <div className="mb-8 text-center">
          <p className="mb-2 text-sm uppercase tracking-[0.25em] text-blue-300">UrbanMove Platform</p>
          <h1 className="text-3xl font-bold text-white">Sign in</h1>
          <p className="mt-2 text-slate-400">Access user services, mobility events and analytics dashboards.</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
          />

          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />

          {error && (
            <div className="rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {error}
            </div>
          )}

          <Button type="submit" fullWidth disabled={loading}>
            {loading ? 'Signing in...' : 'Login'}
          </Button>
          <p className="text-center text-sm text-slate-400">
            Don&apos;t have an account?{' '}
            <a href="/signup" className="text-blue-300 hover:text-blue-200">
              Sign up
            </a>
          </p>
        </form>
      </Card>
    </div>
  )
}