import React, { createContext, useContext, useEffect, useState } from 'react'
import { createContextLogger } from '@/utils/logging'

interface SystemState {
  isSetup: boolean | null
  isLoading: boolean
  error: string | null
}

interface SystemContextType extends SystemState {
  refreshSetupStatus: () => Promise<void>
}

const SystemContext = createContext<SystemContextType | undefined>(undefined)

export const useSystem = () => {
  const context = useContext(SystemContext)
  if (!context) {
    throw new Error('useSystem must be used within a SystemProvider')
  }
  return context
}

export const SystemProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const logger = createContextLogger('SystemProvider')
  const [state, setState] = useState<SystemState>({
    isSetup: null,
    isLoading: true,
    error: null
  })

  const checkSystemSetup = async () => {
    try {
      logger.debug('Checking system setup status')
      
      // This would call the existing system setup check logic
      // Placeholder implementation
      setState(prev => ({
        ...prev,
        isSetup: true,
        isLoading: false,
        error: null
      }))
      
      logger.info('System setup check completed')
    } catch (error) {
      logger.error('System setup check failed', { error })
      setState(prev => ({
        ...prev,
        error: 'Failed to check system setup',
        isLoading: false
      }))
    }
  }

  useEffect(() => {
    checkSystemSetup()
  }, [])

  const refreshSetupStatus = async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }))
    await checkSystemSetup()
  }

  const value: SystemContextType = {
    ...state,
    refreshSetupStatus
  }

  return (
    <SystemContext.Provider value={value}>
      {children}
    </SystemContext.Provider>
  )
}