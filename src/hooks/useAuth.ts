import { useState, useEffect, useCallback } from 'react'
import { getSetting } from '../lib/supabase'

const PIN_KEY = 'cbfi_pin'
const ADMIN_KEY = 'cbfi_admin'

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const cachedPin = localStorage.getItem(PIN_KEY)
    if (cachedPin) {
      setIsAuthenticated(true)
    }
    const adminUnlocked = localStorage.getItem(ADMIN_KEY)
    if (adminUnlocked === 'true') {
      setIsAdmin(true)
    }
    setLoading(false)
  }, [])

  const login = useCallback(async (pin: string): Promise<boolean> => {
    const correctPin = await getSetting('access_pin')
    if (pin === correctPin) {
      localStorage.setItem(PIN_KEY, pin)
      setIsAuthenticated(true)
      return true
    }
    return false
  }, [])

  const loginAdmin = useCallback(async (pin: string): Promise<boolean> => {
    const correctPin = await getSetting('admin_pin')
    if (pin === correctPin) {
      localStorage.setItem(ADMIN_KEY, 'true')
      setIsAdmin(true)
      return true
    }
    return false
  }, [])

  const logoutAdmin = useCallback(() => {
    localStorage.removeItem(ADMIN_KEY)
    setIsAdmin(false)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(PIN_KEY)
    localStorage.removeItem(ADMIN_KEY)
    setIsAuthenticated(false)
    setIsAdmin(false)
  }, [])

  return { isAuthenticated, isAdmin, loading, login, loginAdmin, logoutAdmin, logout }
}
