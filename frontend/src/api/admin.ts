import type { AdminSummary, CongestionSummaryItem } from '../types/api'
import { adminApi } from './clients'

export async function getAdminSummary(): Promise<AdminSummary> {
  const response = await adminApi.get('/admin/summary')
  return response.data
}

export async function getCongestionSummary(): Promise<CongestionSummaryItem[]> {
  const response = await adminApi.get('/analytics/congestion-summary')
  return Array.isArray(response.data) ? response.data : response.data.items ?? []
}