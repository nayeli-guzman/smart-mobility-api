import type { CreateMobilityEventPayload, MobilityEvent } from '../types/api'
import { mobilityApi } from './clients'

export async function createMobilityEvent(payload: CreateMobilityEventPayload) {
  const response = await mobilityApi.post('/mobility/events', payload)
  return response.data
}

export async function listMobilityEvents(): Promise<MobilityEvent[]> {
  const response = await mobilityApi.get('/mobility/events')
  return Array.isArray(response.data) ? response.data : response.data.items ?? []
}

export async function getMobilityEvent(eventId: string): Promise<MobilityEvent> {
  const response = await mobilityApi.get(`/mobility/events/${eventId}`)
  return response.data
}