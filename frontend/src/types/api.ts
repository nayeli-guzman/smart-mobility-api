export interface UserProfile {
  userId: string
  email?: string
  preferences?: {
    transportMode?: string
    avoidCongestion?: boolean
  }
}

export interface UpdatePreferencesPayload {
  transportMode: string
  avoidCongestion: boolean
}

export interface MobilityEvent {
  eventId: string
  userId: string
  zoneId: string
  vehicleId: string
  eventType: string
  timestamp: string
  speed?: number
  latitude?: number
  longitude?: number
}

export interface CreateMobilityEventPayload {
  userId: string
  zoneId: string
  vehicleId: string
  eventType: string
  timestamp: string
  speed?: number
  latitude?: number
  longitude?: number
}

export interface AdminSummary {
  activeUsers?: number
  totalEvents?: number
  congestedZones?: number
  avgResponseMs?: number
  [key: string]: unknown
}

export interface CongestionSummaryItem {
  zoneId?: string
  zone?: string
  congestionLevel?: number
  level?: number
  status?: string
  [key: string]: unknown
}