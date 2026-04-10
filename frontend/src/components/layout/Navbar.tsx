import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import Button from '../ui/Button'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <header className="sticky top-0 z-20 border-b border-white/10 bg-slate-950/60 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <div>
          <h1 className="text-xl font-bold tracking-wide text-white">SMART MOBILITY</h1>
          <p className="text-xs text-slate-400">Cloud Native Mobility Platform</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm font-medium text-white">{user?.email}</p>
            <p className="text-xs text-slate-400">{user?.isAdmin ? 'Administrator' : 'User'}</p>
          </div>

          <Button onClick={() => void handleLogout()} className="bg-slate-800 hover:bg-slate-700 shadow-none">
            Logout
          </Button>
        </div>
      </div>
    </header>
  )
}