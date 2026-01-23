import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react'
import { useNavigate } from 'react-router-dom'
import { api, AuthenticationError } from '../lib/api'
import type { Staff } from '../lib/api-types'

// Session timeout: 15 minutes for staff (stricter than users)
const SESSION_TIMEOUT_MS = 15 * 60 * 1000
const SESSION_CHECK_INTERVAL_MS = 60 * 1000 // Check every minute

interface AuthContextType {
  staff: Staff | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  login: (staffId: string, password: string) => Promise<void>
  logout: () => Promise<void>
  clearError: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [staff, setStaff] = useState<Staff | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastActivity, setLastActivity] = useState<number>(Date.now())
  const navigate = useNavigate()

  const isAuthenticated = staff !== null

  // Update last activity on user interaction
  const updateActivity = useCallback(() => {
    setLastActivity(Date.now())
  }, [])

  // Check if session has timed out
  const checkSessionTimeout = useCallback(() => {
    if (isAuthenticated && Date.now() - lastActivity > SESSION_TIMEOUT_MS) {
      handleSessionExpired()
    }
  }, [isAuthenticated, lastActivity])

  // Handle session expiration
  const handleSessionExpired = useCallback(async () => {
    setStaff(null)
    setError('セッションがタイムアウトしました。再度ログインしてください。')
    navigate('/login')
  }, [navigate])

  // Check current session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await api.getCurrentStaff()
        if (response.status === 'success' && response.data) {
          setStaff(response.data)
        }
      } catch (err) {
        // No active session - that's ok
        setStaff(null)
      } finally {
        setIsLoading(false)
      }
    }

    checkSession()
  }, [])

  // Set up session timeout check interval
  useEffect(() => {
    if (!isAuthenticated) return

    const intervalId = setInterval(checkSessionTimeout, SESSION_CHECK_INTERVAL_MS)

    return () => clearInterval(intervalId)
  }, [isAuthenticated, checkSessionTimeout])

  // Track user activity
  useEffect(() => {
    if (!isAuthenticated) return

    const events = ['mousedown', 'keydown', 'touchstart', 'scroll']
    events.forEach((event) => {
      window.addEventListener(event, updateActivity)
    })

    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, updateActivity)
      })
    }
  }, [isAuthenticated, updateActivity])

  const login = useCallback(async (staffId: string, password: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await api.staffLogin({ staff_id: staffId, password })
      if (response.status === 'success' && response.data) {
        setStaff(response.data.staff)
        setLastActivity(Date.now())
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'ログインに失敗しました'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const logout = useCallback(async () => {
    try {
      await api.logout()
    } catch (err) {
      // Even if logout API fails, clear local state
      console.error('Logout error:', err)
    } finally {
      setStaff(null)
      setError(null)
      navigate('/login')
    }
  }, [navigate])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const value: AuthContextType = {
    staff,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout,
    clearError,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export { AuthContext }
export type { AuthContextType }
