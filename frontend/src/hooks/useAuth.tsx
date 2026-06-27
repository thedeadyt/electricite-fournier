import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import axios from 'axios'
import api, { setAccessToken } from '@/lib/api'

type AuthUser = { role: 'ADMIN' | 'EMPLOYEE'; firstName: string } | null

type AuthCtx = {
  user: AuthUser
  isRestoring: boolean
  login: (identifier: string, pin: string) => Promise<{ firstLogin?: boolean; role?: string }>
  firstLogin: (identifier: string, pin: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthCtx>(null!)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser>(null)
  const [isRestoring, setIsRestoring] = useState(true)

  useEffect(() => {
    axios.post('/api/auth/refresh', {}, { withCredentials: true })
      .then(({ data }) => {
        setAccessToken(data.accessToken)
        setUser({ role: data.role, firstName: data.firstName })
      })
      .catch(() => {
        // No valid session — stay logged out
      })
      .finally(() => setIsRestoring(false))
  }, [])

  async function login(identifier: string, pin: string): Promise<{ firstLogin?: boolean; role?: string }> {
    try {
      const { data } = await api.post('/auth/login', { identifier, pin })
      setAccessToken(data.accessToken)
      setUser({ role: data.role, firstName: data.firstName })
      return { role: data.role }
    } catch (err: any) {
      if (err.response?.data?.firstLogin) {
        return { firstLogin: true }
      }
      throw err
    }
  }

  async function firstLogin(identifier: string, pin: string) {
    const { data } = await api.post('/auth/first-login', { identifier, pin })
    setAccessToken(data.accessToken)
    setUser({ role: data.role, firstName: data.firstName })
  }

  async function logout() {
    await api.post('/auth/logout')
    setAccessToken(null)
    setUser(null)
  }

  return <AuthContext.Provider value={{ user, isRestoring, login, firstLogin, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
