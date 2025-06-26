
import { useMemo } from 'react'
import { useGlobalStateContext } from '@/contexts/GlobalStateContext'

// Hook optimizado para componentes que solo necesitan el estado de loading
export const useGlobalLoading = () => {
  const { isLoading, setLoading } = useGlobalStateContext()
  
  return useMemo(() => ({
    isLoading,
    setLoading
  }), [isLoading, setLoading])
}

// Hook optimizado para el manejo de errores
export const useGlobalError = () => {
  const { error, hasError, setError } = useGlobalStateContext()
  
  return useMemo(() => ({
    error,
    hasError,
    setError
  }), [error, hasError, setError])
}

// Hook optimizado para notificaciones
export const useGlobalNotifications = () => {
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
}

// Hook optimizado para el sidebar
export const useGlobalSidebar = () => {
  const { sidebarCollapsed, toggleSidebar } = useGlobalStateContext()
  
  return useMemo(() => ({
    sidebarCollapsed,
    toggleSidebar
  }), [sidebarCollapsed, toggleSidebar])
}

// Hook optimizado para tema y idioma
export const useGlobalPreferences = () => {
  const { theme, language, setTheme, setLanguage } = useGlobalStateContext()
  
  return useMemo(() => ({
    theme,
    language,
    setTheme,
    setLanguage
  }), [theme, language, setTheme, setLanguage])
}
