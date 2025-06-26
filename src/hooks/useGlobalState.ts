
import { useState, useCallback, useRef, useEffect, useMemo } from 'react'
import { useApp } from '@/contexts/AppContext'

interface NotificationAction {
  label: string
  onClick: () => void
  variant?: 'default' | 'destructive' | 'outline'
}

interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message: string
  description?: string
  timestamp: Date
  read: boolean
  persistent?: boolean
  action?: NotificationAction
  autoClose?: boolean
  duration?: number
}

interface GlobalState {
  isLoading: boolean
  error: string | null
  notifications: Notification[]
  sidebarCollapsed: boolean
  theme: 'light' | 'dark' | 'system'
  language: 'es' | 'en'
}

interface UseGlobalStateReturn extends GlobalState {
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => string
  removeNotification: (id: string) => void
  markAsRead: (id: string) => void
  clearNotifications: () => void
  markAllAsRead: () => void
  toggleSidebar: () => void
  setTheme: (theme: GlobalState['theme']) => void
  setLanguage: (language: GlobalState['language']) => void
}

const initialState: GlobalState = {
  isLoading: false,
  error: null,
  notifications: [],
  sidebarCollapsed: false,
  theme: 'system',
  language: 'es'
}

// Memoizar las opciones de tema para evitar recreaciones
const themeOptions = {
  light: () => document.documentElement.classList.remove('dark'),
  dark: () => document.documentElement.classList.add('dark'),
  system: () => {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    if (prefersDark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }
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

  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp' | 'read'>): string => {
    const id = Math.random().toString(36).substr(2, 9)
    const newNotification: Notification = {
      ...notification,
      id,
      timestamp: new Date(),
      read: false
    }

    setState(prev => ({
      ...prev,
      notifications: [newNotification, ...prev.notifications.slice(0, 99)] // Limitar a 100 notificaciones
    }))

    // Auto-remover notificación si no es persistente
    if (notification.autoClose !== false && !notification.persistent) {
      const duration = notification.duration || 5000
      const timeout = setTimeout(() => {
        removeNotification(id)
      }, duration)
      notificationTimeoutRef.current.set(id, timeout)
    }

    return id
  }, [removeNotification])

  const markAsRead = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      notifications: prev.notifications.map(n => n.id === id ? { ...n, read: true } : n)
    }))
  }, [])

  const markAllAsRead = useCallback(() => {
    setState(prev => ({
      ...prev,
      notifications: prev.notifications.map(n => ({ ...n, read: true }))
    }))
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
    
    // Aplicar tema inmediatamente usando las opciones memoizadas
    themeOptions[theme]()
  }, [])

  const setLanguage = useCallback((language: GlobalState['language']) => {
    setState(prev => ({ ...prev, language }))
  }, [])

  // Memoizar solo las propiedades críticas para el rendimiento
  const memoizedNotificationsCount = useMemo(() => state.notifications.length, [state.notifications.length])
  
  return {
    ...state,
    setLoading,
    setError,
    addNotification,
    removeNotification,
    markAsRead,
    markAllAsRead,
    clearNotifications,
    toggleSidebar,
    setTheme,
    setLanguage
  }
}
