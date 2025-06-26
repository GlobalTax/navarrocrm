
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
  const [isSetup, setIsSetup] = useState<boolean | null>(null)
  const [setupLoading, setSetupLoading] = useState(true)
  
  const initializationStarted = useRef(false)
  const profileEnrichmentInProgress = useRef(false)

  // Estado combinado de carga inicial - solo para inicialización crítica
  const isInitializing = authLoading && setupLoading

  // Obtener acciones de autenticación del hook
  const { signIn, signUp, signOut: baseSignOut } = useAuthActions()

  // Función mejorada para establecer el usuario con validación
  const setUserWithValidation = (newUser: AuthUser) => {
    console.log('👤 [AppContext] Estableciendo usuario:', {
      id: newUser.id,
      email: newUser.email,
      role: newUser.role,
      org_id: newUser.org_id
    })
    setUser(newUser)
  }

  useEffect(() => {
    if (initializationStarted.current) return
    initializationStarted.current = true

    console.log('🚀 [AppContext] Inicialización rápida...')
    
    // Inicializar setup de forma no bloqueante
    initializeSystemSetup(setIsSetup, setSetupLoading)
    
    // Configurar listener de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔄 [AppContext] Auth event:', event, session ? 'con sesión' : 'sin sesión')
      
      setSession(session)
      
      if (session?.user) {
        // Configurar usuario básico inmediatamente para evitar bloqueos
        const basicUser = session.user as AuthUser
        console.log('👤 [AppContext] Usuario básico establecido temporalmente')
        setUser(basicUser)
        
        // Enriquecer perfil de forma asíncrona
        console.log('👤 [AppContext] Iniciando enriquecimiento del perfil...')
        await enrichUserProfileAsync(session.user, setUserWithValidation, profileEnrichmentInProgress)
      } else {
        console.log('👤 [AppContext] Limpiando usuario (sin sesión)')
        setUser(null)
      }
      
      setAuthLoading(false)
    })

    // Obtener sesión inicial
    getInitialSession(setSession, setAuthLoading).then(async (session) => {
      if (session?.user) {
        const basicUser = session.user as AuthUser
        console.log('👤 [AppContext] Usuario inicial básico establecido')
        setUser(basicUser)
        
        // Enriquecer perfil inmediatamente en la carga inicial
        console.log('👤 [AppContext] Enriquecimiento inicial del perfil...')
        await enrichUserProfileAsync(session.user, setUserWithValidation, profileEnrichmentInProgress)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  // Wrapper para signOut que también limpia el estado local
  const signOut = async () => {
    console.log('🚪 [AppContext] Cerrando sesión y limpiando estado')
    await baseSignOut()
    // Limpiar estado local inmediatamente
    setUser(null)
    setSession(null)
  }

  const value: AppState = {
    user,
    session,
    authLoading,
    isSetup,
    setupLoading,
    isInitializing,
    signIn,
    signUp,
    signOut,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}
