import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import type { User } from '../types'
import { useAuthContext } from '../context/AuthContext'
import api from '../services/api'

export function useAuth() {
  const { user, accessToken, setAuth, clearAuth } = useAuthContext()
  const navigate = useNavigate()

  const isAuthenticated = !!accessToken && !!user
  const role = user?.role ?? null

  const login = useCallback(
    (token: string, userData: User) => {
      setAuth(token, userData)
    },
    [setAuth]
  )

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout')
    } catch {
      // ignore logout errors
    }
    clearAuth()
    navigate('/login')
  }, [clearAuth, navigate])

  return { user, role, isAuthenticated, login, logout }
}
