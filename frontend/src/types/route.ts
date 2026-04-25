export type TravelMode = 'car' | 'bike' | 'walk'

export type RouteRequest = {
  origin: string
  destination: string
  mode: TravelMode
}

export type RouteStep = {
  instruction: string
  durationMin: number
}

export type RouteResult = {
  origin: string
  destination: string
  mode: TravelMode
  distanceKm: number
  durationMin: number
  congestionLevel: 'LOW' | 'MEDIUM' | 'HIGH'
  recommendation: string
  steps: RouteStep[]
}

export interface CreateRouteRecommendationPayload {
  startPoint: string
  endPoint: string
  travelMode: TravelMode
}

export interface RouteRecommendation {
  routeId: string
  userId: string
  email?: string
  startPoint: string
  endPoint: string
  travelMode: TravelMode
  status: string
  createdAt: string
}

export interface RouteRecommendationResponse {
  message: string
  routeId: string
  data: RouteRecommendation
}