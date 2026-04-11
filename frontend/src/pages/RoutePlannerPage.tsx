import { useState } from 'react'
import AppShell from '../components/layout/AppShell'
import SectionTitle from '../components/ui/SectionTitle'
import RoutePlannerForm from '../components/route/RoutePlannerForm'
import RouteResultCard from '../components/route/RouteResultCard'
import { generateMockRoute } from '../utils/mockRoute'
import type { RouteRequest, RouteResult } from '../types/route'

export default function RoutePlannerPage() {
  const [route, setRoute] = useState<RouteResult | null>(null)

  function handleGenerate(input: RouteRequest) {
    setRoute(generateMockRoute(input))
  }

  return (
    <AppShell>
      <SectionTitle
        title="Route Recommendation"
        subtitle="Just DEMO!!"
      />

      <div className="grid gap-6 xl:grid-cols-[520px_minmax(0,1fr)]">
        <RoutePlannerForm onGenerate={handleGenerate} />
        <RouteResultCard route={route} />
      </div>
    </AppShell>
  )
}