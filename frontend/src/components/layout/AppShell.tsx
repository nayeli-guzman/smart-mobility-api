import type { ReactNode } from 'react'
import Navbar from './Navbar'
import Sidebar from './Sidebar'

interface Props {
  children: ReactNode
}

export default function AppShell({ children }: Props) {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-6 py-8 lg:grid-cols-[260px_1fr]">
        <Sidebar />
        <section>{children}</section>
      </main>
    </div>
  )
}