
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

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [authLoading, setAuthLoading] = useState(true)
  
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
        console.log('👤 [AppContext] No hay sesión inicial')
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
