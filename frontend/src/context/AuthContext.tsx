import { createContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type { AuthContextType, AuthUser, LoginCredentials } from '../types/auth'
import { loginRequest, logoutRequest, getCurrentIdToken } from '../api/auth'
import { removeToken, saveToken } from '../utils/storage'
import { parseUserFromToken } from '../utils/token'

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface Props {
  children: ReactNode
}

export function AuthProvider({ children }: Props) {
  const [token, setToken] = useState<string | null>(null)
  const [user, setUser] = useState<AuthUser | null>(null)
  const [bootstrapped, setBootstrapped] = useState(false)

  useEffect(() => {
    async function bootstrapAuth() {
      try {
        const currentToken = await getCurrentIdToken()

        if (currentToken) {
          saveToken(currentToken)
          setToken(currentToken)
          setUser(parseUserFromToken(currentToken))
        } else {
          removeToken()
          setToken(null)
          setUser(null)
        }
      } catch {
        removeToken()
        setToken(null)
        setUser(null)
      } finally {
        setBootstrapped(true)
      }
    }

    void bootstrapAuth()
  }, [])

  const login = async (credentials: LoginCredentials) => {
    const receivedToken = await loginRequest(credentials)
    saveToken(receivedToken)
    setToken(receivedToken)
    setUser(parseUserFromToken(receivedToken))
  }

  const logout = async () => {
    try {
      await logoutRequest()
    } finally {
      removeToken()
      setToken(null)
      setUser(null)
    }
  }

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(token),
      login,
      logout,
    }),
    [user, token],
  )

  if (!bootstrapped) {
    return null
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}