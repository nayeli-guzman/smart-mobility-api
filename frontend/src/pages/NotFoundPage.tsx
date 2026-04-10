import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <h1 className="text-6xl font-bold text-white">404</h1>
      <p className="mt-4 text-slate-400">Page not found.</p>
      <Link
        to="/dashboard"
        className="mt-6 rounded-2xl bg-blue-600 px-5 py-3 font-medium text-white transition hover:bg-blue-500"
      >
        Back to dashboard
      </Link>
    </div>
  )
}