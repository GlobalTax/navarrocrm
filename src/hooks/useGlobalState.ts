
import { useState, useCallback, useRef, useEffect } from 'react'
import { useApp } from '@/contexts/AppContext'

interface GlobalState {
  isLoading: boolean
  error: string | null
  notifications: Array<{
    id: string
    type: 'success' | 'error' | 'warning' | 'info'
    message: string
    description?: string
    timestamp: Date
  }>
  sidebarCollapsed: boolean
  theme: 'light' | 'dark' | 'system'
  language: 'es' | 'en'
}

interface UseGlobalStateReturn extends GlobalState {
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  addNotification: (notification: Omit<GlobalState['notifications'][0], 'id' | 'timestamp'>) => void
  removeNotification: (id: string) => void
  toggleSidebar: () => void
  setTheme: (theme: GlobalState['theme']) => void
  setLanguage: (language: GlobalState['language']) => void
  clearNotifications: () => void
}

const initialState: GlobalState = {
  isLoading: false,
  error: null,
  notifications: [],
  sidebarCollapsed: false,
  theme: 'system',
  language: 'es'
}

export const useGlobalState = (): UseGlobalStateReturn => {
  const { user } = useApp()
  const [state, setState] = useState<GlobalState>(initialState)
  const notificationTimeoutRef = useRef<Map<string, NodeJS.Timeout>>(new Map())

  // Cargar estado desde localStorage al inicializar
  useEffect(() => {
    try {
      const savedState = localStorage.getItem('crm-global-state')
      if (savedState) {
        const parsed = JSON.parse(savedState)
        setState(prev => ({
          ...prev,
          sidebarCollapsed: parsed.sidebarCollapsed ?? prev.sidebarCollapsed,
          theme: parsed.theme ?? prev.theme,
          language: parsed.language ?? prev.language
        }))
      }
    } catch (error) {
      console.warn('Error loading global state from localStorage:', error)
    }
  }, [])

  // Guardar estado en localStorage cuando cambie
  useEffect(() => {
    try {
      const stateToSave = {
        sidebarCollapsed: state.sidebarCollapsed,
        theme: state.theme,
        language: state.language
      }
      localStorage.setItem('crm-global-state', JSON.stringify(stateToSave))
    } catch (error) {
      console.warn('Error saving global state to localStorage:', error)
    }
  }, [state.sidebarCollapsed, state.theme, state.language])

  // Limpiar timeouts al desmontar
  useEffect(() => {
    return () => {
      notificationTimeoutRef.current.forEach(timeout => clearTimeout(timeout))
      notificationTimeoutRef.current.clear()
    }
  }, [])

  const setLoading = useCallback((loading: boolean) => {
    setState(prev => ({ ...prev, isLoading: loading }))
  }, [])

  const setError = useCallback((error: string | null) => {
    setState(prev => ({ ...prev, error }))
  }, [])

  const addNotification = useCallback((notification: Omit<GlobalState['notifications'][0], 'id' | 'timestamp'>) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newNotification = {
      ...notification,
      id,
      timestamp: new Date()
    }

    setState(prev => ({
      ...prev,
      notifications: [...prev.notifications, newNotification]
    }))

    // Auto-remover notificación después de 5 segundos
    const timeout = setTimeout(() => {
      removeNotification(id)
    }, 5000)

    notificationTimeoutRef.current.set(id, timeout)
  }, [])

  const removeNotification = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      notifications: prev.notifications.filter(n => n.id !== id)
    }))

    // Limpiar timeout si existe
    const timeout = notificationTimeoutRef.current.get(id)
    if (timeout) {
      clearTimeout(timeout)
      notificationTimeoutRef.current.delete(id)
    }
  }, [])

  const clearNotifications = useCallback(() => {
    // Limpiar todos los timeouts
    notificationTimeoutRef.current.forEach(timeout => clearTimeout(timeout))
    notificationTimeoutRef.current.clear()

    setState(prev => ({
      ...prev,
      notifications: []
    }))
  }, [])

  const toggleSidebar = useCallback(() => {
    setState(prev => ({
      ...prev,
      sidebarCollapsed: !prev.sidebarCollapsed
    }))
  }, [])

  const setTheme = useCallback((theme: GlobalState['theme']) => {
    setState(prev => ({ ...prev, theme }))
    
    // Aplicar tema inmediatamente
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else if (theme === 'light') {
      document.documentElement.classList.remove('dark')
    } else {
      // system - usar preferencia del sistema
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      if (prefersDark) {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    }
  }, [])

  const setLanguage = useCallback((language: GlobalState['language']) => {
    setState(prev => ({ ...prev, language }))
    // Aquí podrías implementar cambio de idioma
  }, [])

  return {
    ...state,
    setLoading,
    setError,
    addNotification,
    removeNotification,
    clearNotifications,
    toggleSidebar,
    setTheme,
    setLanguage
  }
}
