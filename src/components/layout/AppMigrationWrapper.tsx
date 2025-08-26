/**
 * Temporary wrapper to handle migration from old AppContext to new Auth/System contexts
 * This ensures backward compatibility during the transition period
 */

import React from 'react'
import { useAuth } from '@/contexts/auth'
import { useSystem } from '@/contexts/system/SystemProvider'
import { AppState } from '@/contexts/types'

// Legacy useApp hook that maps new contexts to old interface
export const useApp = (): AppState => {
  const auth = useAuth()
  const system = useSystem()

  return {
    // Auth state mapping
    user: auth.user,
    session: auth.session,
    authLoading: auth.isLoading,
    
    // System setup mapping
    isSetup: system.isSetup,
    setupLoading: system.isLoading,
    
    // Combined loading state
    isInitializing: auth.isLoading || system.isLoading,
    
    // Actions mapping - convert return types for compatibility
    signIn: async (email: string, password: string) => {
      const result = await auth.signIn(email, password)
      if (result.error) throw new Error(result.error)
    },
    activateAccount: async (token: string, password: string) => {
      const result = await auth.activateAccount(token, password)
      if (result.error) throw new Error(result.error)
    },
    signOut: auth.signOut,
  }
}

// Export for components still using the old pattern
export { useApp as useLegacyApp }