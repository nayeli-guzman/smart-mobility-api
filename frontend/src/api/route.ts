import { routeApi } from './clients'
import type { RouteRequest } from '../types/route'

export async function createRouteRecommendation(input: RouteRequest) {
  const response = await routeApi.post('/routes/recommend', {
    startPoint: input.origin,
    endPoint: input.destination,
    travelMode: input.mode,
  })

  return response.data
}

export async function getRouteRecommendation(routeId: string) {
  const response = await routeApi.get(`/routes/recommend/${routeId}`)
  return response.data
}