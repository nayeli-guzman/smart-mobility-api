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