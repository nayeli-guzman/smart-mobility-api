import axios from 'axios'
import { getCurrentIdToken } from './auth'

function buildClient(baseURL: string) {
  const client = axios.create({
    baseURL,
    headers: {
      'Content-Type': 'application/json',
    },
  })

  client.interceptors.request.use(async (config) => {
    const token = await getCurrentIdToken()

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  })

  return client
}

export const userApi = buildClient(import.meta.env.VITE_USER_API_URL || '')
export const adminApi = buildClient(import.meta.env.VITE_ADMIN_API_URL || '')
export const mobilityApi = buildClient(import.meta.env.VITE_MOBILITY_API_URL || '')
export const routeApi = buildClient(import.meta.env.VITE_ROUTE_API_URL || '')