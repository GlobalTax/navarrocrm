
import { useMemo } from 'react'
import { useGlobalStateContext } from '@/contexts/GlobalStateContext'

// Hook optimizado para componentes que solo necesitan el estado de loading
export const useGlobalLoading = () => {
  try {
    const { isLoading, setLoading } = useGlobalStateContext()
    
    return useMemo(() => ({
      isLoading,
      setLoading
    }), [isLoading, setLoading])
  } catch (error) {
    console.warn('useGlobalLoading: GlobalStateContext not available, using defaults')
    return {
      isLoading: false,
      setLoading: () => {}
    }
  }
}

// Hook optimizado para el manejo de errores
export const useGlobalError = () => {
  try {
    const { error, hasError, setError } = useGlobalStateContext()
    
    return useMemo(() => ({
      error,
      hasError,
      setError
    }), [error, hasError, setError])
  } catch (error) {
    console.warn('useGlobalError: GlobalStateContext not available, using defaults')
    return {
      error: null,
      hasError: false,
      setError: () => {}
    }
  }
}

// Hook optimizado para notificaciones
export const useGlobalNotifications = () => {
  try {
    const { 
      notifications, 
      unreadCount,
      hasUnreadNotifications,
      addNotification, 
      removeNotification, 
      markAsRead, 
      markAllAsRead, 
      clearNotifications 
    } = useGlobalStateContext()
    
    return useMemo(() => ({
      notifications,
      unreadCount,
      hasUnreadNotifications,
      addNotification,
      removeNotification,
      markAsRead,
      markAllAsRead,
      clearNotifications
    }), [
      notifications,
      unreadCount,
      hasUnreadNotifications,
      addNotification,
      removeNotification,
      markAsRead,
      markAllAsRead,
      clearNotifications
    ])
  } catch (error) {
    console.warn('useGlobalNotifications: GlobalStateContext not available, using defaults')
    return {
      notifications: [],
      unreadCount: 0,
      hasUnreadNotifications: false,
      addNotification: () => '',
      removeNotification: () => {},
      markAsRead: () => {},
      markAllAsRead: () => {},
      clearNotifications: () => {}
    }
  }
}

// Hook optimizado para el sidebar
export const useGlobalSidebar = () => {
  try {
    const { sidebarCollapsed, toggleSidebar } = useGlobalStateContext()
    
    return useMemo(() => ({
      sidebarCollapsed,
      toggleSidebar
    }), [sidebarCollapsed, toggleSidebar])
  } catch (error) {
    console.warn('useGlobalSidebar: GlobalStateContext not available, using defaults')
    return {
      sidebarCollapsed: false,
      toggleSidebar: () => {}
    }
  }
}

// Hook optimizado para tema y idioma
export const useGlobalPreferences = () => {
  try {
    const { theme, language, setTheme, setLanguage } = useGlobalStateContext()
    
    return useMemo(() => ({
      theme,
      language,
      setTheme,
      setLanguage
    }), [theme, language, setTheme, setLanguage])
  } catch (error) {
    console.warn('useGlobalPreferences: GlobalStateContext not available, using defaults')
    return {
      theme: 'system' as const,
      language: 'es' as const,
      setTheme: () => {},
      setLanguage: () => {}
    }
  }
}
