import type { CreateMobilityEventPayload, MobilityEvent } from '../types/api'
import { mobilityApi } from './clients'

export interface ListMobilityEventsResponse {
  count: number
  items: MobilityEvent[]
  nextToken: string | null
  hasMore: boolean
}

export async function createMobilityEvent(payload: CreateMobilityEventPayload) {
  const response = await mobilityApi.post('/mobility/events', payload)
  return response.data
}

export async function listMobilityEvents(
  limit = 20,
  nextToken?: string,
  userId?: string,
) : Promise<ListMobilityEventsResponse> {
  const params: Record<string, string | number> = { limit }

  if (nextToken) params.nextToken = nextToken
  if (userId) params.userId = userId

  const response = await mobilityApi.get('/mobility/events', { params })
  return response.data
}

export async function getMobilityEvent(eventId: string): Promise<MobilityEvent> {
  const response = await mobilityApi.get(`/mobility/events/${eventId}`)
  return response.data
}