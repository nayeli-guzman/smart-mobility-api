import type { RouteResult } from '../../types/route'

type Props = {
  route: RouteResult | null
}

function congestionStyles(level: RouteResult['congestionLevel']) {
  switch (level) {
    case 'HIGH':
      return 'border-red-400/30 bg-red-500/10 text-red-200'
    case 'MEDIUM':
      return 'border-yellow-400/30 bg-yellow-500/10 text-yellow-200'
    case 'LOW':
    default:
      return 'border-emerald-400/30 bg-emerald-500/10 text-emerald-200'
  }
}

export default function RouteResultCard({ route }: Props) {
  if (!route) {
    return (
      <div className="rounded-3xl border border-dashed border-white/15 bg-white/5 p-6 text-slate-400">
        No route generated yet. Enter an origin and destination to preview a recommended route.
      </div>
    )
  }

  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_10px_40px_rgba(0,0,0,0.25)] backdrop-blur">
      <div className="mb-6 flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-900/30 px-4 py-4">
  <div className="h-3 w-3 rounded-full bg-emerald-400" />
  <div className="h-[2px] flex-1 bg-gradient-to-r from-emerald-400 via-blue-400 to-fuchsia-400" />
  <div className="h-3 w-3 rounded-full bg-fuchsia-400" />
</div>
      <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <h3 className="text-xl font-semibold text-white">Recommended Route</h3>
          <p className="mt-1 text-sm text-slate-400">
            {route.origin} → {route.destination}
          </p>
        </div>

        <span
          className={`rounded-full border px-3 py-1 text-xs font-semibold ${congestionStyles(route.congestionLevel)}`}
        >
          {route.congestionLevel} congestion
        </span>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-4">
          <p className="text-sm text-slate-400">Distance</p>
          <p className="mt-2 text-2xl font-bold text-white">{route.distanceKm} km</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-4">
          <p className="text-sm text-slate-400">Estimated Time</p>
          <p className="mt-2 text-2xl font-bold text-white">{route.durationMin} min</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-4">
          <p className="text-sm text-slate-400">Mode</p>
          <p className="mt-2 text-2xl font-bold capitalize text-white">{route.mode}</p>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-white/10 bg-slate-900/30 p-4">
        <p className="text-sm font-medium text-slate-300">Recommendation</p>
        <p className="mt-2 text-slate-200">{route.recommendation}</p>
      </div>

      <div className="mt-6">
        <h4 className="mb-3 text-lg font-semibold text-white">Route Steps</h4>
        <div className="space-y-3">
          {route.steps.map((step, index) => (
            <div
              key={`${step.instruction}-${index}`}
              className="rounded-2xl border border-white/10 bg-slate-900/40 px-4 py-4"
            >
              <div className="flex items-start justify-between gap-4">
                <p className="text-slate-200">
                  <span className="mr-2 font-semibold text-blue-300">#{index + 1}</span>
                  {step.instruction}
                </p>
                <span className="text-sm text-slate-400">{step.durationMin} min</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}