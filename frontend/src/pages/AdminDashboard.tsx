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

  useEffect(() => {
    async function load() {
      try {
        const [summaryData, congestionData] = await Promise.all([
          getAdminSummary(),
          getCongestionSummary(),
        ])

        setSummary(summaryData)
        setCongestion(congestionData)
      } catch {
        setError('Could not load admin endpoints. Verify JWT group and Lambda response shape.')
      }
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
        <StatCard title="Active Users" value={String(summary?.activeUsers ?? 'N/A')} />
        <StatCard title="Total Events" value={String(summary?.totalEvents ?? 'N/A')} />
        <StatCard title="Congested Zones" value={String(summary?.congestedZones ?? congestion.length)} />
        <StatCard title="Avg Response" value={summary?.avgResponseMs ? `${summary.avgResponseMs} ms` : 'N/A'} />
      </div>

      <div className="mt-6">
        <Card>
          <h3 className="mb-5 text-xl font-semibold text-white">Congestion Summary</h3>

          {congestion.length === 0 ? (
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
                  </tr>
                </thead>
                <tbody>
                  {congestion.map((item, index) => (
                    <tr key={`${item.zoneId ?? item.zone ?? 'zone'}-${index}`} className="bg-white/5 text-slate-200">
                      <td className="rounded-l-2xl px-4 py-4">{item.zoneId ?? item.zone ?? 'Unknown'}</td>
                      <td className="px-4 py-4">{item.congestionLevel ?? item.level ?? 'N/A'}</td>
                      <td className="rounded-r-2xl px-4 py-4">{item.status ?? 'N/A'}</td>
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