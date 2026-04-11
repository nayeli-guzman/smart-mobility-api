import { useEffect, useState } from 'react'
import AppShell from '../components/layout/AppShell'
import SectionTitle from '../components/ui/SectionTitle'
import StatCard from '../components/ui/StatCard'
import Card from '../components/ui/Card'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import { createMobilityEvent, listMobilityEvents } from '../api/mobility'
import { useAuth } from '../hooks/useAuth'
import type { CreateMobilityEventPayload, MobilityEvent } from '../types/api'

export default function UserDashboard() {
  const { user } = useAuth()

  const [events, setEvents] = useState<MobilityEvent[]>([])
  const [loadingEvents, setLoadingEvents] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const [nextToken, setNextToken] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(false)

  const [form, setForm] = useState<CreateMobilityEventPayload>({
    userId: user?.userId ?? '',
    zoneId: 'zone-a',
    vehicleId: 'vehicle-001',
    eventType: 'location_update',
    timestamp: new Date().toISOString(),
    speed: 42,
    latitude: 60.1699,
    longitude: 24.9384,
  })

  useEffect(() => {
    if (user?.userId) {
      setForm((prev) => ({
        ...prev,
        userId: user.userId,
      }))
    }
  }, [user])

  async function loadInitialEvents() {
    if (!user?.userId) return

    setLoadingEvents(true)
    setError('')

    try {
      const data = await listMobilityEvents(20, undefined, user.userId)
      setEvents(data.items)
      setNextToken(data.nextToken)
      setHasMore(data.hasMore)
    } catch (err) {
      setEvents([])
      setNextToken(null)
      setHasMore(false)
      setError(err instanceof Error ? err.message : 'Could not load events')
    } finally {
      setLoadingEvents(false)
    }
  }

  async function refreshEvents() {
    if (!user?.userId) return

    setRefreshing(true)
    setError('')

    try {
      const data = await listMobilityEvents(20, undefined, user.userId)
      setEvents(data.items)
      setNextToken(data.nextToken)
      setHasMore(data.hasMore)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not refresh events')
    } finally {
      setRefreshing(false)
    }
  }

  async function loadMoreEvents() {
    if (!user?.userId || !nextToken) return

    setLoadingMore(true)
    setError('')

    try {
      const data = await listMobilityEvents(20, nextToken, user.userId)
      setEvents((prev) => [...prev, ...data.items])
      setNextToken(data.nextToken)
      setHasMore(data.hasMore)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load more events')
    } finally {
      setLoadingMore(false)
    }
  }

  useEffect(() => {
    void loadInitialEvents()
  }, [user?.userId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setMessage('')
    setError('')

    try {
      await createMobilityEvent({
        ...form,
        userId: user?.userId ?? form.userId,
        timestamp: new Date().toISOString(),
      })

      setMessage('Mobility event created successfully.')
      await refreshEvents()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create event')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AppShell>
      <SectionTitle
        title="User Dashboard"
        subtitle="Register mobility events and inspect your recent platform activity."
      />

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          title="Loaded Events"
          value={events.length}
          subtitle="Loaded in the current session"
        />
        <StatCard
          title="Current User"
          value={user?.isAdmin ? 'Admin' : 'User'}
          subtitle={user?.email ?? 'Unknown user'}
        />
        <StatCard
          title="Region"
          value="eu-north-1"
          subtitle="AWS deployment region"
        />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <Card>
          <h3 className="mb-5 text-xl font-semibold text-white">Create Mobility Event</h3>

          <form onSubmit={handleSubmit} className="grid gap-4">
            <Input
              label="Zone ID"
              value={form.zoneId}
              onChange={(e) => setForm((prev) => ({ ...prev, zoneId: e.target.value }))}
            />

            <Input
              label="Vehicle ID"
              value={form.vehicleId}
              onChange={(e) => setForm((prev) => ({ ...prev, vehicleId: e.target.value }))}
            />

            <Input
              label="Event Type"
              value={form.eventType}
              onChange={(e) => setForm((prev) => ({ ...prev, eventType: e.target.value }))}
            />

            <Input
              label="Speed"
              type="number"
              value={form.speed ?? 0}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  speed: Number(e.target.value),
                }))
              }
            />

            <Input
              label="Latitude"
              type="number"
              step="any"
              value={form.latitude ?? 0}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  latitude: Number(e.target.value),
                }))
              }
            />

            <Input
              label="Longitude"
              type="number"
              step="any"
              value={form.longitude ?? 0}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  longitude: Number(e.target.value),
                }))
              }
            />

            <Button type="submit" disabled={submitting}>
              {submitting ? 'Submitting...' : 'Create Event'}
            </Button>

            {message && (
              <div className="rounded-2xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
                {message}
              </div>
            )}

            {error && (
              <div className="rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {error}
              </div>
            )}
          </form>
        </Card>

        <Card>
          <div className="mb-5 flex items-center justify-between gap-3">
            <h3 className="text-xl font-semibold text-white">Recent Mobility Events</h3>

            <Button
              onClick={() => void refreshEvents()}
              disabled={refreshing || loadingEvents}
              className="bg-slate-800 hover:bg-slate-700 shadow-none"
            >
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </Button>
          </div>

          {loadingEvents ? (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-slate-400">
              Loading events...
            </div>
          ) : events.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/15 p-6 text-slate-400">
              No events found for this user.
            </div>
          ) : (
            <div className="space-y-4">
              {events.map((event) => (
                <div
                  key={event.eventId}
                  className="rounded-2xl border border-white/10 bg-white/5 p-4"
                >
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <Badge>{event.eventType}</Badge>
                    <span className="text-xs text-slate-400">{event.timestamp}</span>
                  </div>

                  <div className="grid gap-2 text-sm text-slate-200 md:grid-cols-2">
                    <p>
                      <span className="text-slate-400">Event ID:</span> {event.eventId}
                    </p>
                    <p>
                      <span className="text-slate-400">User ID:</span> {event.userId}
                    </p>
                    <p>
                      <span className="text-slate-400">Zone:</span> {event.zoneId}
                    </p>
                    <p>
                      <span className="text-slate-400">Vehicle:</span> {event.vehicleId}
                    </p>
                    <p>
                      <span className="text-slate-400">Speed:</span> {event.speed ?? 'N/A'}
                    </p>
                    <p>
                      <span className="text-slate-400">Latitude:</span> {event.latitude ?? 'N/A'}
                    </p>
                    <p>
                      <span className="text-slate-400">Longitude:</span> {event.longitude ?? 'N/A'}
                    </p>
                  </div>
                </div>
              ))}

              {hasMore && (
                <div className="pt-2">
                  <Button
                    onClick={() => void loadMoreEvents()}
                    disabled={loadingMore}
                    className="w-full bg-slate-800 hover:bg-slate-700 shadow-none"
                  >
                    {loadingMore ? 'Loading more...' : 'Load more'}
                  </Button>
                </div>
              )}
            </div>
          )}
        </Card>
      </div>
    </AppShell>
  )
}