import type { RouteRecommendation } from '../../types/route'

type Props = {
  items: RouteRecommendation[]
  loading: boolean
  onLoadMore?: () => void
  hasMore: boolean
}

export default function RouteHistoryList({
  items,
  loading,
  onLoadMore,
  hasMore,
}: Props) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_10px_40px_rgba(0,0,0,0.25)] backdrop-blur">
      <h3 className="text-xl font-semibold text-white">Route History</h3>
      <p className="mt-1 text-sm text-slate-400">
        Saved journeys started by the authenticated user.
      </p>

      <div className="mt-6 space-y-3">
        {items.length === 0 && !loading && (
          <div className="rounded-2xl border border-dashed border-white/10 p-4 text-sm text-slate-400">
            No saved journeys yet.
          </div>
        )}

        {items.map((route) => (
          <div
            key={route.routeId}
            className="rounded-2xl border border-white/10 bg-slate-900/40 p-4"
          >
            <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="font-semibold text-white">
                  {route.startPoint} → {route.endPoint}
                </p>
                <p className="mt-1 text-sm text-slate-400">
                  Mode: <span className="capitalize">{route.travelMode}</span>
                </p>
              </div>

              <span className="rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-200">
                {route.status}
              </span>
            </div>

            <p className="mt-3 text-xs text-slate-500">
              Created at: {new Date(route.createdAt).toLocaleString()}
            </p>
          </div>
        ))}
      </div>

      {hasMore && (
        <button
          type="button"
          onClick={onLoadMore}
          disabled={loading}
          className="mt-5 w-full rounded-2xl bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? 'Loading...' : 'Load more'}
        </button>
      )}
    </div>
  )
}