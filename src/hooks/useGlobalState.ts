
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
  // Nuevas funciones de utilidad memoizadas
  unreadCount: number
  hasError: boolean
  hasUnreadNotifications: boolean
}

const initialState: GlobalState = {
  isLoading: false,
  error: null,
  notifications: [],
  sidebarCollapsed: false,
  theme: 'system',
  language: 'es'
}

// Constantes memoizadas fuera del componente
const THEME_HANDLERS = Object.freeze({
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
} as const)

const MAX_NOTIFICATIONS = 100
const NOTIFICATION_DEFAULT_DURATION = 5000
const LOCALSTORAGE_DEBOUNCE_DELAY = 300
const STORAGE_KEY = 'crm-global-state'

// Función debounce optimizada
const createDebounce = <T extends (...args: any[]) => void>(
  func: T,
  delay: number
): T => {
  let timeoutId: NodeJS.Timeout
  return ((...args: Parameters<T>) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func(...args), delay)
  }) as T
}

export const useGlobalState = (): UseGlobalStateReturn => {
  const { user } = useApp()
  const [state, setState] = useState<GlobalState>(initialState)
  const notificationTimeoutRef = useRef<Map<string, NodeJS.Timeout>>(new Map())
  const saveToStorageRef = useRef<(state: Partial<GlobalState>) => void>()

  // Debounced localStorage save - solo se crea una vez
  useEffect(() => {
    saveToStorageRef.current = createDebounce((stateToSave: Partial<GlobalState>) => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave))
      } catch (error) {
        console.warn('Error saving global state to localStorage:', error)
      }
    }, LOCALSTORAGE_DEBOUNCE_DELAY)
  }, [])

  // Cargar estado desde localStorage al inicializar - solo una vez
  useEffect(() => {
    try {
      const savedState = localStorage.getItem(STORAGE_KEY)
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

  // Guardar estado en localStorage cuando cambie - con debounce
  useEffect(() => {
    const stateToSave = {
      sidebarCollapsed: state.sidebarCollapsed,
      theme: state.theme,
      language: state.language
    }
    saveToStorageRef.current?.(stateToSave)
  }, [state.sidebarCollapsed, state.theme, state.language])

  // Limpiar timeouts al desmontar
  useEffect(() => {
    return () => {
      notificationTimeoutRef.current.forEach(timeout => clearTimeout(timeout))
      notificationTimeoutRef.current.clear()
    }
  }, [])

  // Valores computados memoizados para evitar recálculos
  const computedValues = useMemo(() => {
    const unreadCount = state.notifications.filter(n => !n.read).length
    const hasError = Boolean(state.error)
    const hasUnreadNotifications = unreadCount > 0

    return {
      unreadCount,
      hasError,
      hasUnreadNotifications
    }
  }, [state.notifications, state.error])

  // Funciones memoizadas con useCallback
  const setLoading = useCallback((loading: boolean) => {
    setState(prev => prev.isLoading !== loading ? { ...prev, isLoading: loading } : prev)
  }, [])

  const setError = useCallback((error: string | null) => {
    setState(prev => prev.error !== error ? { ...prev, error } : prev)
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
    const id = `notif_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
    const newNotification: Notification = {
      ...notification,
      id,
      timestamp: new Date(),
      read: false
    }

    setState(prev => ({
      ...prev,
      notifications: [newNotification, ...prev.notifications.slice(0, MAX_NOTIFICATIONS - 1)]
    }))

    // Auto-remover notificación si no es persistente
    if (notification.autoClose !== false && !notification.persistent) {
      const duration = notification.duration || NOTIFICATION_DEFAULT_DURATION
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
      notifications: prev.notifications.map(n => 
        n.id === id && !n.read ? { ...n, read: true } : n
      )
    }))
  }, [])

  const markAllAsRead = useCallback(() => {
    setState(prev => ({
      ...prev,
      notifications: prev.notifications.map(n => 
        !n.read ? { ...n, read: true } : n
      )
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
    setState(prev => prev.theme !== theme ? { ...prev, theme } : prev)
    
    // Aplicar tema inmediatamente usando handlers memoizados
    THEME_HANDLERS[theme]()
  }, [])

  const setLanguage = useCallback((language: GlobalState['language']) => {
    setState(prev => prev.language !== language ? { ...prev, language } : prev)
  }, [])

  // Memoizar el objeto de retorno completo
  return useMemo(() => ({
    ...state,
    ...computedValues,
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
  }), [
    state,
    computedValues,
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
  ])
}
