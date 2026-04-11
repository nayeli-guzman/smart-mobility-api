import { useEffect, useState } from 'react'
import AppShell from '../components/layout/AppShell'
import SectionTitle from '../components/ui/SectionTitle'
import StatCard from '../components/ui/StatCard'
import Card from '../components/ui/Card'
import { getAdminSummary, getCongestionSummary } from '../api/admin'
import type { AdminSummary, CongestionSummaryItem } from '../types/api'

export default function AdminDashboard() {
  const [summary, setSummary] = useState<AdminSummary | null>(null)
  const [congestion, setCongestion] = useState<CongestionSummaryItem[]>([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)
      setError('')

      const [summaryResult, congestionResult] = await Promise.allSettled([
        getAdminSummary(),
        getCongestionSummary(),
      ])

      if (summaryResult.status === 'fulfilled') {
        setSummary(summaryResult.value)
      } else {
        console.error('Admin summary failed:', summaryResult.reason)
      }

      if (congestionResult.status === 'fulfilled') {
        setCongestion(congestionResult.value)
      } else {
        console.error('Congestion summary failed:', congestionResult.reason)
      }

      if (
        summaryResult.status === 'rejected' &&
        congestionResult.status === 'rejected'
      ) {
        setError('Could not load admin endpoints.')
      } else if (congestionResult.status === 'rejected') {
        setError('Congestion summary could not be loaded.')
      } else if (summaryResult.status === 'rejected') {
        setError('Admin summary could not be loaded.')
      }

      setLoading(false)
    }

    void load()
  }, [])

  return (
    <AppShell>
      <SectionTitle
        title="Admin Dashboard"
        subtitle="Administrative overview backed by admin-api endpoints."
      />

      {error && (
        <div className="mb-6 rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Active Users"
          value={loading ? '...' : String(summary?.activeUsers ?? 0)}
        />
        <StatCard
          title="Total Events"
          value={loading ? '...' : String(summary?.totalEvents ?? 0)}
        />
        <StatCard
          title="Congested Zones"
          value={loading ? '...' : String(summary?.congestedZones ?? congestion.length)}
        />
        <StatCard
          title="Avg Response"
          value={loading ? '...' : `${summary?.avgResponseMs ?? 0} ms`}
        />
      </div>

      <div className="mt-6">
        <Card>
          <h3 className="mb-5 text-xl font-semibold text-white">Congestion Summary</h3>

          {loading ? (
            <div className="rounded-2xl border border-dashed border-white/15 p-6 text-slate-400">
              Loading admin data...
            </div>
          ) : congestion.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/15 p-6 text-slate-400">
              No congestion data returned.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full border-separate border-spacing-y-3">
                <thead>
                  <tr className="text-left text-sm text-slate-400">
                    <th className="px-4">Zone</th>
                    <th className="px-4">Level</th>
                    <th className="px-4">Status</th>
                    <th className="px-4">Events</th>
                    <th className="px-4">Avg Speed</th>
                    <th className="px-4">Active Vehicles</th>
                  </tr>
                </thead>
                <tbody>
                  {congestion.map((item, index) => (
                    <tr key={`${item.zoneId}-${index}`} className="bg-white/5 text-slate-200">
                      <td className="rounded-l-2xl px-4 py-4">{item.zoneId}</td>
                      <td className="px-4 py-4">{item.congestionLevel}</td>
                      <td className="px-4 py-4">{item.status}</td>
                      <td className="px-4 py-4">{item.events ?? 0}</td>
                      <td className="px-4 py-4">{item.avgSpeed ?? 0}</td>
                      <td className="rounded-r-2xl px-4 py-4">{item.activeVehicles ?? 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </AppShell>
  )
}