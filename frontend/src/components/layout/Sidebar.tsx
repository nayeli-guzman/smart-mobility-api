import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

function linkClass(active: boolean) {
  return `block rounded-2xl px-4 py-3 transition ${
    active
      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
      : 'bg-white/5 text-slate-300 hover:bg-white/10'
  }`
}

export default function Sidebar() {
  const location = useLocation()
  const { user } = useAuth()

  return (
    <aside className="w-full max-w-xs rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
      <nav className="flex flex-col gap-3">
        <Link to="/dashboard" className={linkClass(location.pathname === '/dashboard')}>
          Dashboard
        </Link>

        <Link to="/profile" className={linkClass(location.pathname === '/profile')}>
          Profile
        </Link>

        {user?.isAdmin && (
          <Link to="/admin" className={linkClass(location.pathname === '/admin')}>
            Admin
          </Link>
        )}
      </nav>
    </aside>
  )
}