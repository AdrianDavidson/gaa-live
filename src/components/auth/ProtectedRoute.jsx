import { useAuth, useUser } from '@clerk/react'
import { Navigate } from 'react-router-dom'
import Spinner from '../ui/Spinner'

function ProtectedRoute({ children, requiredRole }) {
  const { isLoaded, isSignedIn } = useAuth()
  const { user } = useUser()
  if (!isLoaded) return <Spinner label="Loading…" />
  if (!isSignedIn) return <Navigate to="/login" replace />
  const role = user?.publicMetadata?.role ?? 'user'
  if (requiredRole === 'pro'   && !['pro', 'admin'].includes(role)) return <Navigate to="/" replace />
  if (requiredRole === 'admin' && role !== 'admin') return <Navigate to="/" replace />
  return children
}

export const RequirePro   = ({ children }) => <ProtectedRoute requiredRole="pro">{children}</ProtectedRoute>
export const RequireAdmin = ({ children }) => <ProtectedRoute requiredRole="admin">{children}</ProtectedRoute>
