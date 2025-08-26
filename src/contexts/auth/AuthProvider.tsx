import React, { createContext, useContext, useEffect, useState, useRef } from 'react'
import { Session } from '@supabase/supabase-js'
import { supabase } from '@/integrations/supabase/client'
import { AuthContextType, AuthUser, AuthState } from './types'
import { useAuthActions } from './hooks/useAuthActions'
import { enrichUserProfile } from './utils/profileEnrichment'
import { createContextLogger } from '@/utils/logging'

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const logger = createContextLogger('AuthProvider')
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    isLoading: true,
    isInitialized: false,
    error: null
  })

  const initializationStarted = useRef(false)
  const authActions = useAuthActions(setAuthState, logger)

  useEffect(() => {
    if (initializationStarted.current) return
    initializationStarted.current = true

    logger.info('Initializing authentication')

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        logger.debug('Auth state change', { event, hasSession: !!session })

        try {
          if (session?.user) {
            // Basic user setup
            let user = session.user as AuthUser
            
            // Enrich with profile data
            const enrichedUser = await enrichUserProfile(user, logger)
            
            setAuthState(prev => ({
              ...prev,
              user: enrichedUser,
              session,
              isLoading: false,
              isInitialized: true,
              error: null
            }))
          } else {
            setAuthState(prev => ({
              ...prev,
              user: null,
              session: null,
              isLoading: false,
              isInitialized: true,
              error: null
            }))
          }
        } catch (error) {
          logger.error('Error handling auth state change', { error })
          setAuthState(prev => ({
            ...prev,
            error: 'Authentication error occurred',
            isLoading: false,
            isInitialized: true
          }))
        }
      }
    )

    // Get initial session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        logger.error('Error getting initial session', { error })
        setAuthState(prev => ({
          ...prev,
          error: 'Failed to get session',
          isLoading: false,
          isInitialized: true
        }))
      }
      // The onAuthStateChange handler will process the session
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const value: AuthContextType = {
    ...authState,
    ...authActions
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}