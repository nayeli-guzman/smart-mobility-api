import { jwtDecode } from 'jwt-decode'
import type { AuthUser } from '../types/auth'

interface JwtPayload {
  sub?: string
  email?: string
  'cognito:username'?: string
  'cognito:groups'?: string[]
}

export function parseUserFromToken(token: string): AuthUser {
  const decoded = jwtDecode<JwtPayload>(token)
  const groups = decoded['cognito:groups'] ?? []

  return {
    userId: decoded.sub ?? decoded['cognito:username'] ?? 'demo-user-id',
    email: decoded.email ?? 'unknown@user.com',
    groups,
    isAdmin: groups.includes('admin'),
  }
}