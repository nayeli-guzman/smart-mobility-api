import type { UpdatePreferencesPayload, UserProfile } from '../types/api'
import { userApi } from './clients'

export async function getUser(userId: string): Promise<UserProfile> {
  const response = await userApi.get(`/users/${userId}`)
  return response.data
}

export async function updateUserPreferences(userId: string, payload: UpdatePreferencesPayload) {
  const response = await userApi.patch(`/users/${userId}/preferences`, payload)
  return response.data
}

export async function bootstrapUser() {
  const response = await userApi.post('/users/bootstrap')
  return response.data
}