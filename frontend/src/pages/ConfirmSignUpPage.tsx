import { useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import Card from '../components/ui/Card'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import { confirmSignUpRequest, resendConfirmationCodeRequest } from '../api/auth'

export default function ConfirmSignUpPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const email = useMemo(() => searchParams.get('email') ?? '', [searchParams])

  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setMessage('')
    setLoading(true)

    try {
      await confirmSignUpRequest(email, code)
      setMessage('Account confirmed. You can now sign in.')
      setTimeout(() => navigate('/login'), 1200)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Confirmation failed')
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    setError('')
    setMessage('')
    setResending(true)

    try {
      await resendConfirmationCodeRequest(email)
      setMessage('A new confirmation code was sent.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not resend code')
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <Card className="w-full max-w-md">
        <div className="mb-8 text-center">
          <p className="mb-2 text-sm uppercase tracking-[0.25em] text-blue-300">UrbanMove Platform</p>
          <h1 className="text-3xl font-bold text-white">Confirm account</h1>
          <p className="mt-2 text-slate-400">Enter the verification code sent to {email || 'your email'}.</p>
        </div>

        <form onSubmit={handleConfirm} className="flex flex-col gap-5">
          <Input
            label="Confirmation code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="123456"
          />

          {error && (
            <div className="rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {error}
            </div>
          )}

          {message && (
            <div className="rounded-2xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
              {message}
            </div>
          )}

          <Button type="submit" fullWidth disabled={loading}>
            {loading ? 'Confirming...' : 'Confirm account'}
          </Button>

          <Button
            type="button"
            fullWidth
            disabled={resending}
            onClick={() => void handleResend()}
            className="bg-slate-800 hover:bg-slate-700 shadow-none"
          >
            {resending ? 'Resending...' : 'Resend code'}
          </Button>
        </form>
      </Card>
    </div>
  )
}