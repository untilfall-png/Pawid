import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import api, { tokenStore } from '../lib/api'

const AuthContext = createContext(null)

const TOKEN_KEY = 'pawid_token'

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [hasPets, setHasPets] = useState(false)
  const [loading, setLoading] = useState(true)

  // Restaurar sesión al cargar la app
  useEffect(() => {
    const stored = localStorage.getItem(TOKEN_KEY)
    if (!stored) { setLoading(false); return }

    tokenStore.set(stored)
    api.get('/auth/me')
      .then(data => {
        setUser(data.user)
        setHasPets(data.hasPets)
      })
      .catch(() => {
        localStorage.removeItem(TOKEN_KEY)
        tokenStore.clear()
      })
      .finally(() => setLoading(false))
  }, [])

  const login = useCallback(({ user, token, hasPets = false }) => {
    localStorage.setItem(TOKEN_KEY, token)
    tokenStore.set(token)
    setUser(user)
    setHasPets(hasPets)
  }, [])

  const logout = useCallback(() => {
    api.post('/auth/logout').catch(() => {})
    localStorage.removeItem(TOKEN_KEY)
    tokenStore.clear()
    setUser(null)
    setHasPets(false)
  }, [])

  const refreshHasPets = useCallback((value) => {
    setHasPets(value)
  }, [])

  return (
    <AuthContext.Provider value={{
      user,
      hasPets,
      loading,
      isAuthenticated: !!user,
      login,
      logout,
      refreshHasPets,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider')
  return ctx
}
