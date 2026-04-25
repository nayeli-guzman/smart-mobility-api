import { useEffect, useState } from 'react'
import AppShell from '../components/layout/AppShell'
import SectionTitle from '../components/ui/SectionTitle'
import RoutePlannerForm from '../components/route/RoutePlannerForm'
import RouteResultCard from '../components/route/RouteResultCard'
import RouteHistoryList from '../components/route/RouteHistoryList'
import { generateMockRoute } from '../utils/mockRoute'
import type { RouteRecommendation, RouteRequest, RouteResult } from '../types/route'
import { createRouteRecommendation } from '../api/route'
import { getUserRouteHistory } from '../api/user'
import { getCurrentIdToken } from '../api/auth'

function getSubFromJwt(token: string): string | null {
  try {
    const payload = token.split('.')[1]
    const decoded = JSON.parse(atob(payload))
    return decoded.sub ?? null
  } catch {
    return null
  }
}

export default function RoutePlannerPage() {
  const [route, setRoute] = useState<RouteResult | null>(null)
  const [routeRequest, setRouteRequest] = useState<RouteRequest | null>(null)

  const [history, setHistory] = useState<RouteRecommendation[]>([])
  const [nextToken, setNextToken] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)

  const [saving, setSaving] = useState(false)
  const [loadingHistory, setLoadingHistory] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  async function loadHistory(userIdValue: string, token?: string | null) {
    try {
      setLoadingHistory(true)

      const result = await getUserRouteHistory(userIdValue, 5, token ?? undefined)

      if (token) {
        setHistory((prev) => [...prev, ...result.items])
      } else {
        setHistory(result.items)
      }

      setNextToken(result.nextToken ?? null)
    } catch (err) {
      console.error(err)
      setError(err instanceof Error ? err.message : 'Error loading route history')
    } finally {
      setLoadingHistory(false)
    }
  }

  useEffect(() => {
    async function init() {
      const token = await getCurrentIdToken()
      if (!token) return

      const sub = getSubFromJwt(token)
      if (!sub) return

      setUserId(sub)
      await loadHistory(sub)
    }

    void init()
  }, [])

  function handleGenerate(input: RouteRequest) {
    setError('')
    setMessage('')
    setRouteRequest(input)
    setRoute(generateMockRoute(input))
  }

  async function handleBeginJourney() {
    if (!routeRequest || !userId) return

    try {
      setSaving(true)
      setError('')
      setMessage('')

      const savedRoute = await createRouteRecommendation(routeRequest)

      setMessage(`Journey started. Route ID: ${savedRoute.routeId}`)

      await loadHistory(userId)
    } catch (err) {
      console.error(err)
      setError(err instanceof Error ? err.message : 'Error starting journey')
    } finally {
      setSaving(false)
    }
  }

  async function handleLoadMore() {
    if (!userId || !nextToken) return
    await loadHistory(userId, nextToken)
  }

  return (
    <AppShell>
      <SectionTitle
        title="Route Recommendation"
        subtitle="Generate a route preview and start a saved journey."
      />

      {error && (
        <div className="mb-4 rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      )}

      {message && (
        <div className="mb-4 rounded-2xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
          {message}
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[520px_minmax(0,1fr)]">
        <RoutePlannerForm onGenerate={handleGenerate} />

        <div className="space-y-4">
          <RouteResultCard route={route} />

          {route && (
            <button
              type="button"
              onClick={handleBeginJourney}
              disabled={saving}
              className="w-full rounded-2xl bg-emerald-600 px-4 py-3 font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? 'Starting journey...' : 'Begin Journey'}
            </button>
          )}

          <RouteHistoryList
            items={history}
            loading={loadingHistory}
            hasMore={Boolean(nextToken)}
            onLoadMore={handleLoadMore}
          />
        </div>
      </div>
    </AppShell>
  )
}