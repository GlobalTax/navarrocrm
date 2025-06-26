
import React, { createContext, useContext, ReactNode, memo } from 'react'
import { useGlobalState } from '@/hooks/useGlobalState'

type GlobalStateContextType = ReturnType<typeof useGlobalState>

const GlobalStateContext = createContext<GlobalStateContextType | undefined>(undefined)

export const useGlobalStateContext = () => {
  const context = useContext(GlobalStateContext)
  if (context === undefined) {
    throw new Error('useGlobalStateContext must be used within a GlobalStateProvider')
  }
  return context
}

interface GlobalStateProviderProps {
  children: ReactNode
}

// Memoizar el provider para evitar re-renders innecesarios
const GlobalStateProviderComponent: React.FC<GlobalStateProviderProps> = ({ children }) => {
  const globalState = useGlobalState()

  // Memoizar el valor del contexto
  const contextValue = React.useMemo(() => globalState, [globalState])

  return (
    <GlobalStateContext.Provider value={contextValue}>
      {children}
    </GlobalStateContext.Provider>
  )
}

// Exportar versión memoizada
export const GlobalStateProvider = memo(GlobalStateProviderComponent)
GlobalStateProvider.displayName = 'GlobalStateProvider'
