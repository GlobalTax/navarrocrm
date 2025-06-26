
import React, { createContext, useContext, useEffect, useState, useRef } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/integrations/supabase/client'
import { AppState, AuthUser, UserRole } from './types'
import { useAuthActions } from './hooks/useAuthActions'
import { enrichUserProfileAsync } from './utils/profileHandler'

const AppContext = createContext<AppState | undefined>(undefined)

export const useApp = () => {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider')
  }
  return context
}

// Generar UUIDs válidos para desarrollo
const generateValidUUID = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  // Fallback para entornos que no soporten crypto.randomUUID
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0
    const v = c == 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

// UUIDs fijos para desarrollo (se generan una vez y se reutilizan)
const TEMP_USER_ID = generateValidUUID()
const TEMP_ORG_ID = generateValidUUID()

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [isSetup, setIsSetup] = useState<boolean | null>(true)
  const [setupLoading, setSetupLoading] = useState(false)
  
  const initializationStarted = useRef(false)
  const profileEnrichmentInProgress = useRef(false)

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
      id: TEMP_USER_ID,
      email: 'dev@legalflow.com',
      role: 'partner' as UserRole,
      org_id: TEMP_ORG_ID,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      aud: 'authenticated',
      app_metadata: { temp_user: true },
      user_metadata: { temp_user: true },
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

  const clearAuthState = () => {
    console.log('🧹 [AppContext] Limpiando estado de autenticación')
    setUser(null)
    setSession(null)
    setAuthLoading(false)
  }

  useEffect(() => {
    if (initializationStarted.current) return
    initializationStarted.current = true

    console.log('🚀 [AppContext] Inicializando autenticación...')
    
    // Configurar listener de cambios de auth PRIMERO
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔄 [AppContext] Auth event:', event, session ? 'con sesión' : 'sin sesión')
      
      if (session?.user) {
        const basicUser = session.user as AuthUser
        console.log('👤 [AppContext] Usuario real establecido')
        setUser(basicUser)
        setSession(session)
        
        // Enriquecer perfil de forma asíncrona
        setTimeout(() => {
          enrichUserProfileAsync(session.user, setUserWithValidation, profileEnrichmentInProgress)
        }, 0)
      } else if (event === 'SIGNED_OUT') {
        console.log('👤 [AppContext] Usuario cerró sesión')
        clearAuthState()
      }
      
      setAuthLoading(false)
    })

    // LUEGO verificar sesión existente
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const basicUser = session.user as AuthUser
        console.log('👤 [AppContext] Sesión inicial encontrada')
        setUser(basicUser)
        setSession(session)
        
        // Enriquecer perfil de forma asíncrona
        setTimeout(() => {
          enrichUserProfileAsync(session.user, setUserWithValidation, profileEnrichmentInProgress)
        }, 0)
      } else {
        // Si no hay sesión real, crear usuario temporal para desarrollo
        console.log('👤 [AppContext] No hay sesión real, creando usuario temporal')
        createTempUser()
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
      clearAuthState()
    } catch (error) {
      console.log('Error cerrando sesión:', error)
      clearAuthState()
    }
  }

  const value: AppState = {
    user,
    session,
    authLoading,
    isSetup: true,
    setupLoading: false,
    isInitializing: authLoading,
    signIn,
    signUp,
    signOut,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}
