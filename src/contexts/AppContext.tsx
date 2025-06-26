
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
  const [isSetup, setIsSetup] = useState<boolean | null>(true) // Cambiar a true por defecto
  const [setupLoading, setSetupLoading] = useState(false) // Cambiar a false
  
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

  // Crear usuario temporal para modo desarrollo
  const createTempUser = () => {
    const tempUser: AuthUser = {
      id: 'temp-user-dev',
      email: 'dev@legalflow.com',
      role: 'partner' as UserRole,
      org_id: 'temp-org-dev',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
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
    
    // Para desarrollo, crear usuario temporal inmediatamente
    createTempUser()
    
    // Configurar listener de autenticación solo si hay conexión real a Supabase
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔄 [AppContext] Auth event:', event, session ? 'con sesión' : 'sin sesión')
      
      if (session?.user) {
        // Usuario real de Supabase
        const basicUser = session.user as AuthUser
        console.log('👤 [AppContext] Usuario real establecido')
        setUser(basicUser)
        setSession(session)
        
        // Enriquecer perfil de forma asíncrona
        await enrichUserProfileAsync(session.user, setUserWithValidation, profileEnrichmentInProgress)
      } else if (event === 'SIGNED_OUT') {
        console.log('👤 [AppContext] Usuario cerró sesión, volviendo a temporal')
        createTempUser() // Volver al usuario temporal
      }
      
      setAuthLoading(false)
    })

    // Verificar sesión inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const basicUser = session.user as AuthUser
        console.log('👤 [AppContext] Sesión inicial encontrada')
        setUser(basicUser)
        setSession(session)
        
        enrichUserProfileAsync(session.user, setUserWithValidation, profileEnrichmentInProgress)
      }
      // Si no hay sesión real, el usuario temporal ya está creado
      setAuthLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  // Wrapper para signOut que mantiene usuario temporal
  const signOut = async () => {
    console.log('🚪 [AppContext] Cerrando sesión')
    try {
      await baseSignOut()
    } catch (error) {
      console.log('Error cerrando sesión:', error)
    }
    // Crear usuario temporal después del logout
    createTempUser()
  }

  const value: AppState = {
    user,
    session,
    authLoading: false, // Siempre false ya que tenemos usuario temporal
    isSetup: true, // Siempre true para desarrollo
    setupLoading: false,
    isInitializing: false,
    signIn,
    signUp,
    signOut,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}
