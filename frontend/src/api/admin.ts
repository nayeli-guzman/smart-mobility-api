import type { AdminSummary, CongestionSummaryItem } from '../types/api'
import { adminApi } from './clients'

function unwrapPayload(payload: any) {
  if (payload == null) return payload

  if (payload.data != null) {
    return unwrapPayload(payload.data)
  }

  if (typeof payload.body === 'string') {
    try {
      return JSON.parse(payload.body)
    } catch {
      return payload
    }
  }

  if (payload.body && typeof payload.body === 'object') {
    return payload.body
  }

  return payload
}

export async function getAdminSummary(): Promise<AdminSummary> {
  const raw = await adminApi.get('/admin/summary')
  const data = unwrapPayload(raw)

  return {
    activeUsers: Number(data.activeUsers ?? data.active_users ?? 0),
    totalEvents: Number(data.totalEvents ?? data.total_events ?? 0),
    congestedZones: Number(
      data.congestedZones ??
      data.congested_zones ??
      (Array.isArray(data.highCongestionZones) ? data.highCongestionZones.length : 0)
    ),
    avgResponseMs: Number(data.avgResponseMs ?? data.avg_response_ms ?? 0),
  }
}

export async function getCongestionSummary(): Promise<CongestionSummaryItem[]> {
  const raw = await adminApi.get('/admin/congestion-summary')
  const data = unwrapPayload(raw)

  const items =
    Array.isArray(data) ? data :
    Array.isArray(data.zones) ? data.zones :
    Array.isArray(data.items) ? data.items :
    Array.isArray(data.results) ? data.results :
    Array.isArray(data.congestion) ? data.congestion :
    []

  return items.map((item: any) => ({
    zoneId: item.zoneId ?? item.zone ?? 'Unknown',
    congestionLevel: item.congestionLevel ?? item.level ?? 'N/A',
    status:
      item.status ??
      (item.congestionLevel === 'HIGH'
        ? 'Congested'
        : item.congestionLevel === 'MEDIUM'
          ? 'Watch'
          : 'Stable'),
    events: Number(item.events ?? 0),
    avgSpeed: Number(item.avgSpeed ?? 0),
    activeVehicles: Number(item.activeVehicles ?? 0),
    lastEventTimestamp: item.lastEventTimestamp ?? '',
  }))
}