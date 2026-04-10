export interface AuthUser {
  userId: string
  email: string
  groups: string[]
  isAdmin: boolean
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface AuthContextType {
  user: AuthUser | null
  token: string | null
  isAuthenticated: boolean
  login: (credentials: LoginCredentials) => Promise<void>
  logout: () => Promise<void>
}