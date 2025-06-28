
import React, { createContext, useContext, ReactNode, memo } from 'react'
import { useGlobalState } from '@/hooks/useGlobalState'

type GlobalStateContextType = ReturnType<typeof useGlobalState>

const GlobalStateContext = createContext<GlobalStateContextType | undefined>(undefined)

export const useGlobalStateContext = () => {
  const context = useContext(GlobalStateContext)
  if (context === undefined) {
    console.error('🚨 [useGlobalStateContext] Context is undefined - Provider not found in component tree')
    throw new Error('useGlobalStateContext must be used within a GlobalStateProvider')
  }
  return context
}

interface GlobalStateProviderProps {
  children: ReactNode
}

// Memoizar el provider para evitar re-renders innecesarios
const GlobalStateProviderComponent: React.FC<GlobalStateProviderProps> = ({ children }) => {
  console.log('🔄 [GlobalStateProvider] Initializing provider')
  
  try {
    const globalState = useGlobalState()
    
    // Memoizar el valor del contexto
    const contextValue = React.useMemo(() => {
      console.log('✅ [GlobalStateProvider] Context value created successfully')
      return globalState
    }, [globalState])

    return (
      <GlobalStateContext.Provider value={contextValue}>
        {children}
      </GlobalStateContext.Provider>
    )
  } catch (error) {
    console.error('🚨 [GlobalStateProvider] Error initializing global state:', error)
    
    // Fallback provider con valores por defecto
    const fallbackValue: GlobalStateContextType = {
      isLoading: false,
      error: null,
      notifications: [],
      sidebarCollapsed: false,
      theme: 'system',
      language: 'es',
      unreadCount: 0,
      hasError: false,
      hasUnreadNotifications: false,
      setLoading: () => {},
      setError: () => {},
      addNotification: () => '',
      removeNotification: () => {},
      markAsRead: () => {},
      markAllAsRead: () => {},
      clearNotifications: () => {},
      toggleSidebar: () => {},
      setTheme: () => {},
      setLanguage: () => {}
    }
    
    return (
      <GlobalStateContext.Provider value={fallbackValue}>
        {children}
      </GlobalStateContext.Provider>
    )
  }
}

// Exportar versión memoizada
export const GlobalStateProvider = memo(GlobalStateProviderComponent)
GlobalStateProvider.displayName = 'GlobalStateProvider'
