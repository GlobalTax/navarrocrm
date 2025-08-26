/**
 * Migration helper for components still using useApp
 * This provides a smooth transition path
 */

import { useAuth } from '@/contexts/auth'
import { useSystem } from '@/contexts/system/SystemProvider'

/**
 * Temporary migration hook to ease transition from useApp
 * Components can import this instead of useApp for a smoother migration
 */
export const useLegacyAppMigration = () => {
  const auth = useAuth()
  const system = useSystem()

  return {
    // Auth properties
    user: auth.user,
    session: auth.session,
    authLoading: auth.isLoading,
    
    // System properties  
    isSetup: system.isSetup,
    setupLoading: system.isLoading,
    
    // Combined loading
    isInitializing: auth.isLoading || system.isLoading,
    
    // Actions
    signIn: auth.signIn,
    signOut: auth.signOut,
    activateAccount: auth.activateAccount,
  }
}

/**
 * Hook that only provides user data - for components that only need user info
 */
export const useUserOnly = () => {
  const { user } = useAuth()
  return { user }
}

/**
 * Hook that provides auth status - for protected routes and auth checks
 */  
export const useAuthStatus = () => {
  const { user, session, isLoading } = useAuth()
  const { isSetup } = useSystem()
  
  return {
    user,
    session, 
    authLoading: isLoading,
    isSetup,
    isAuthenticated: !!user && !!session,
    isReady: !isLoading && isSetup
  }
}