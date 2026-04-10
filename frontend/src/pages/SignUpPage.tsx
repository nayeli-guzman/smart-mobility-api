import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Card from '../components/ui/Card'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import { signUpRequest, getCurrentIdToken } from '../api/auth'
import { parseUserFromToken } from '../utils/token'

export default function SignUpPage() {
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    async function redirectIfLoggedIn() {
      const token = await getCurrentIdToken()

      if (token) {
        const user = parseUserFromToken(token)
        navigate(user.isAdmin ? '/admin' : '/dashboard', { replace: true })
      }
    }

    void redirectIfLoggedIn()
  }, [navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)

    try {
      const result = await signUpRequest({ email, password })

      if (result.nextStep?.signUpStep === 'CONFIRM_SIGN_UP') {
        navigate(`/confirm-signup?email=${encodeURIComponent(email)}`, { replace: true })
      } else {
        navigate('/login', { replace: true })
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign up failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <Card className="w-full max-w-md">
        <div className="mb-8 text-center">
          <p className="mb-2 text-sm uppercase tracking-[0.25em] text-blue-300">UrbanMove Platform</p>
          <h1 className="text-3xl font-bold text-white">Create account</h1>
          <p className="mt-2 text-slate-400">Register a new account to access the platform.</p>
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

          <Input
            label="Confirm password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
          />

          {error && (
            <div className="rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {error}
            </div>
          )}

          <Button type="submit" fullWidth disabled={loading}>
            {loading ? 'Creating account...' : 'Sign up'}
          </Button>

          <p className="text-center text-sm text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-300 hover:text-blue-200">
              Sign in
            </Link>
          </p>
        </form>
      </Card>
    </div>
  )
}