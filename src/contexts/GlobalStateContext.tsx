
import React, { createContext, useContext, ReactNode } from 'react'
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

export const GlobalStateProvider: React.FC<GlobalStateProviderProps> = ({ children }) => {
  const globalState = useGlobalState()

  return (
    <GlobalStateContext.Provider value={globalState}>
      {children}
    </GlobalStateContext.Provider>
  )
}
