
import React, { createContext, useContext, useEffect, useState, useRef } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/integrations/supabase/client'
import { AppState, AuthUser } from './types'
import { clearAuthCaches } from './utils/authCache'
import { isValidSession, cleanCorruptedSessions } from './utils/sessionValidator'
import { checkSystemSetup } from './utils/systemSetup'
import { handleUserProfile } from './utils/profileHandler'
import { useAuthActions } from './hooks/useAuthActions'

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
  const lastAuthEvent = useRef<string | null>(null)
  const profileFetchInProgress = useRef<Set<string>>(new Set())

  // Estado combinado de carga
  const isInitializing = authLoading || setupLoading

  // Get auth actions
  const authActions = useAuthActions()

  useEffect(() => {
    if (initializationStarted.current) return
    initializationStarted.current = true

    console.log('🚀 [AppContext] Inicializando aplicación...')
    
    // Verificar y limpiar sesiones corruptas
    cleanCorruptedSessions()
    
    // Inicializar verificación de setup con caché
    initializeSystemSetup()
    
    // Configurar listener de autenticación con manejo mejorado
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      const eventKey = `${event}-${session?.user?.id || 'null'}-${Date.now()}`
      
      // Evitar procesamiento duplicado con timestamp
      if (lastAuthEvent.current === eventKey) {
        console.log('🔄 [AppContext] Evento duplicado ignorado:', event)
        return
      }
      
      lastAuthEvent.current = eventKey
      console.log('🔄 [AppContext] Cambio de estado auth:', event, session ? 'con sesión' : 'sin sesión')
      
      // Validar sesión antes de usarla
      if (session && !isValidSession(session)) {
        console.warn('⚠️ [AppContext] Sesión inválida detectada, limpiando...')
        await cleanCorruptedSessions()
        setSession(null)
        setUser(null)
        setAuthLoading(false)
        return
      }
      
      setSession(session)
      
      if (session?.user) {
        await handleUserProfileUpdate(session.user, session)
      } else {
        setUser(null)
        setAuthLoading(false)
      }
    })

    // Obtener sesión inicial con validación
    supabase.auth.getSession().then(async ({ data: { session }, error }) => {
      if (error) {
        console.error('❌ [AppContext] Error obteniendo sesión inicial:', error)
        await cleanCorruptedSessions()
        setAuthLoading(false)
        return
      }

      console.log('📋 [AppContext] Sesión inicial:', session ? 'Encontrada' : 'No encontrada')
      
      // Validar sesión inicial
      if (session && !isValidSession(session)) {
        console.warn('⚠️ [AppContext] Sesión inicial inválida, limpiando...')
        await cleanCorruptedSessions()
        setSession(null)
        setAuthLoading(false)
        return
      }
      
      setSession(session)
      
      if (session?.user) {
        await handleUserProfileUpdate(session.user, session)
      } else {
        setAuthLoading(false)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const initializeSystemSetup = async () => {
    try {
      setSetupLoading(true)
      const systemIsSetup = await checkSystemSetup()
      setIsSetup(systemIsSetup)
    } catch (error) {
      console.error('❌ [AppContext] Error inicializando setup:', error)
      setIsSetup(true) // Fallback seguro
    } finally {
      setSetupLoading(false)
    }
  }

  const handleUserProfileUpdate = async (authUser: User, userSession: Session) => {
    try {
      const enrichedUser = await handleUserProfile(authUser, userSession, profileFetchInProgress.current)
      setUser(enrichedUser)
    } catch (error: any) {
      console.error('❌ [AppContext] Error actualizando perfil:', error)
      setUser(authUser as AuthUser)
    } finally {
      setAuthLoading(false)
    }
  }

  // Enhanced sign actions with proper loading states
  const signIn = async (email: string, password: string) => {
    setAuthLoading(true)
    try {
      await authActions.signIn(email, password)
    } catch (error) {
      setAuthLoading(false)
      throw error
    }
  }

  const signOut = async () => {
    await authActions.signOut()
    // Limpiar estado local
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
    signUp: authActions.signUp,
    signOut,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}
