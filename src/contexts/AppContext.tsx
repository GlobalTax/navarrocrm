
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

const AppProviderComponent: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [isSetup, setIsSetup] = useState<boolean | null>(null)
  const [setupLoading, setSetupLoading] = useState(true)
  
  const initializationStarted = useRef(false)
  const profileEnrichmentInProgress = useRef(false)
  const emergencyTimeout = useRef<NodeJS.Timeout | null>(null)

  // Estado unificado de preparación de la app
  const appReady = !authLoading && !setupLoading && isSetup !== null
  
  // Estado de inicialización más conservador
  const isInitializing = authLoading || setupLoading

  // Obtener acciones de autenticación del hook
  const { signIn, signUp, signOut: baseSignOut } = useAuthActions()

  useEffect(() => {
    if (initializationStarted.current) return
    initializationStarted.current = true

  // Timeout de emergencia global - después de 8s forzar carga
  emergencyTimeout.current = setTimeout(() => {
    setAuthLoading(false)
    setSetupLoading(false)
    if (isSetup === null) setIsSetup(true)
  }, 8000)
    
    // Inicializar setup de forma no bloqueante
    initializeSystemSetup(setIsSetup, setSetupLoading)
    
    // Configurar listener de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      // Limpiar timeout de emergencia al recibir evento de auth
      if (emergencyTimeout.current) {
        clearTimeout(emergencyTimeout.current)
        emergencyTimeout.current = null
      }
      
      setSession(session)
      
      if (session?.user) {
        // Configurar usuario básico inmediatamente
        const basicUser = session.user as AuthUser
        setUser(basicUser)
        
        // Enriquecer perfil en segundo plano sin bloquear
        enrichUserProfileAsync(session.user, setUser, profileEnrichmentInProgress)
      } else {
        setUser(null)
      }
      
      setAuthLoading(false)
    })

    // Obtener sesión inicial
    getInitialSession(setSession, setAuthLoading).then((session) => {
      if (session?.user) {
        const basicUser = session.user as AuthUser
        setUser(basicUser)
        enrichUserProfileAsync(session.user, setUser, profileEnrichmentInProgress)
      }
    })

    return () => {
      subscription.unsubscribe()
      if (emergencyTimeout.current) {
        clearTimeout(emergencyTimeout.current)
      }
    }
  }, [])

  // Wrapper para signOut que también limpia el estado local
  const signOut = async () => {
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

export const AppProvider = AppProviderComponent
