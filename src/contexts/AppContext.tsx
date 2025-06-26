
import React, { createContext, useContext, useEffect, useState, useRef } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/integrations/supabase/client'
import { AppState, AuthUser, UserRole } from './types'
import { useAuthActions } from './hooks/useAuthActions'
import { enrichUserProfileAsync } from './utils/profileHandler'
import { initializeSystemSetup } from './utils/systemSetup'
import { getInitialSession } from './utils/sessionValidator'

const AppContext = createContext<AppState | undefined>(undefined)

export const useApp = () => {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider')
  }
  return context
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [isSetup, setIsSetup] = useState<boolean | null>(true)
  const [setupLoading, setSetupLoading] = useState(false)
  
  const initializationStarted = useRef(false)
  const profileEnrichmentInProgress = useRef(false)

  const isInitializing = authLoading && setupLoading

  const { signIn, signUp, signOut: baseSignOut } = useAuthActions()

  const setUserWithValidation = (newUser: AuthUser) => {
    console.log('👤 [AppContext] Estableciendo usuario:', {
      id: newUser.id,
      email: newUser.email,
      role: newUser.role,
      org_id: newUser.org_id
    })
    setUser(newUser)
  }

  const createTempUser = () => {
    const tempUser: AuthUser = {
      id: 'temp-user-dev',
      email: 'dev@legalflow.com',
      role: 'partner' as UserRole,
      org_id: 'temp-org-dev',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      aud: 'authenticated',
      app_metadata: {},
      user_metadata: {},
      first_name: 'Usuario',
      last_name: 'Temporal',
      full_name: 'Usuario Temporal'
    }
    
    const tempSession: Session = {
      access_token: 'temp-access-token',
      refresh_token: 'temp-refresh-token',
      expires_in: 3600,
      expires_at: Date.now() + 3600000,
      token_type: 'bearer',
      user: tempUser as any
    }
    
    console.log('🚧 [AppContext] Creando usuario temporal para desarrollo')
    setUser(tempUser)
    setSession(tempSession)
    setAuthLoading(false)
  }

  useEffect(() => {
    if (initializationStarted.current) return
    initializationStarted.current = true

    console.log('🚀 [AppContext] Inicialización rápida...')
    
    createTempUser()
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔄 [AppContext] Auth event:', event, session ? 'con sesión' : 'sin sesión')
      
      if (session?.user) {
        const basicUser = session.user as AuthUser
        console.log('👤 [AppContext] Usuario real establecido')
        setUser(basicUser)
        setSession(session)
        
        await enrichUserProfileAsync(session.user, setUserWithValidation, profileEnrichmentInProgress)
      } else if (event === 'SIGNED_OUT') {
        console.log('👤 [AppContext] Usuario cerró sesión, volviendo a temporal')
        createTempUser()
      }
      
      setAuthLoading(false)
    })

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const basicUser = session.user as AuthUser
        console.log('👤 [AppContext] Sesión inicial encontrada')
        setUser(basicUser)
        setSession(session)
        
        enrichUserProfileAsync(session.user, setUserWithValidation, profileEnrichmentInProgress)
      }
      setAuthLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const signOut = async () => {
    console.log('🚪 [AppContext] Cerrando sesión')
    try {
      await baseSignOut()
    } catch (error) {
      console.log('Error cerrando sesión:', error)
    }
    createTempUser()
  }

  const value: AppState = {
    user,
    session,
    authLoading: false,
    isSetup: true,
    setupLoading: false,
    isInitializing: false,
    signIn,
    signUp,
    signOut,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}
