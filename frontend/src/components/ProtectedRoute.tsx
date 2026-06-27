import { Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'

export function ProtectedRoute({ role, children }: { role?: 'ADMIN' | 'EMPLOYEE'; children: React.ReactNode }) {
  const { user, isRestoring } = useAuth()
  if (isRestoring) return null
  if (!user) return <Navigate to="/app/login" replace />
  if (role && user.role !== role) return <Navigate to="/app" replace />
  return <>{children}</>
}
