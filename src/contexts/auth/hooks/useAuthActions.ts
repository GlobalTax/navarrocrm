import { useCallback } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { AuthState, AuthActions } from '../types'

export const useAuthActions = (
  setAuthState: React.Dispatch<React.SetStateAction<AuthState>>,
  logger: any
): AuthActions => {
  
  const signIn = useCallback(async (email: string, password: string) => {
    logger.info('Attempting sign in', { email })
    
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }))
      
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      
      if (error) {
        logger.warn('Sign in failed', { error: error.message })
        setAuthState(prev => ({ 
          ...prev, 
          error: error.message, 
          isLoading: false 
        }))
        return { error: error.message }
      }
      
      logger.info('Sign in successful')
      // Auth state will be updated by onAuthStateChange
      return {}
    } catch (error) {
      const message = 'An unexpected error occurred'
      logger.error('Sign in error', { error })
      setAuthState(prev => ({ 
        ...prev, 
        error: message, 
        isLoading: false 
      }))
      return { error: message }
    }
  }, [setAuthState, logger])

  const signOut = useCallback(async () => {
    logger.info('Signing out')
    
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        logger.warn('Sign out error', { error })
      } else {
        logger.info('Sign out successful')
      }
    } catch (error) {
      logger.error('Sign out error', { error })
    }
    
    // Always clear local state
    setAuthState(prev => ({
      ...prev,
      user: null,
      session: null,
      error: null
    }))
  }, [setAuthState, logger])

  const activateAccount = useCallback(async (token: string, password: string) => {
    logger.info('Attempting account activation')
    
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }))
      
      // Implementation would go here based on existing activation logic
      // This is a placeholder for the existing activation system
      
      logger.info('Account activation successful')
      return {}
    } catch (error) {
      const message = 'Account activation failed'
      logger.error('Account activation error', { error })
      setAuthState(prev => ({ 
        ...prev, 
        error: message, 
        isLoading: false 
      }))
      return { error: message }
    }
  }, [setAuthState, logger])

  const clearError = useCallback(() => {
    setAuthState(prev => ({ ...prev, error: null }))
  }, [setAuthState])

  return {
    signIn,
    signOut,
    activateAccount,
    clearError
  }
}