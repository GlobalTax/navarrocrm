
import React, { createContext, useContext, useEffect, useState, useRef } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/integrations/supabase/client'
import { AppState, AuthUser, UserRole } from './types'

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

  useEffect(() => {
    if (initializationStarted.current) return
    initializationStarted.current = true

    console.log('🚀 [AppContext] Inicialización rápida...')
    
    // Inicializar setup de forma no bloqueante
    initializeSystemSetup()
    
    // Configurar listener de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔄 [AppContext] Auth event:', event, session ? 'con sesión' : 'sin sesión')
      
      setSession(session)
      
      if (session?.user) {
        // Configurar usuario básico inmediatamente
        const basicUser = session.user as AuthUser
        setUser(basicUser)
        
        // Enriquecer perfil en segundo plano sin bloquear
        enrichUserProfileAsync(session.user, session)
      } else {
        setUser(null)
      }
      
      setAuthLoading(false)
    })

    // Obtener sesión inicial con timeout rápido
    const sessionTimeout = setTimeout(() => {
      console.log('⏰ [AppContext] Timeout de sesión inicial - continuando sin bloquear')
      setAuthLoading(false)
    }, 2000) // Solo 2 segundos de timeout

    supabase.auth.getSession().then(({ data: { session }, error }) => {
      clearTimeout(sessionTimeout)
      
      if (error) {
        console.warn('⚠️ [AppContext] Error obteniendo sesión, continuando:', error.message)
        setAuthLoading(false)
        return
      }

      console.log('📋 [AppContext] Sesión inicial:', session ? 'Encontrada' : 'No encontrada')
      
      setSession(session)
      
      if (session?.user) {
        const basicUser = session.user as AuthUser
        setUser(basicUser)
        enrichUserProfileAsync(session.user, session)
      }
      
      setAuthLoading(false)
    }).catch(() => {
      clearTimeout(sessionTimeout)
      setAuthLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  // Verificación de setup no bloqueante
  const initializeSystemSetup = async () => {
    try {
      console.log('🔧 [AppContext] Verificando setup...')
      
      const timeoutPromise = new Promise<boolean>((resolve) => {
        setTimeout(() => {
          console.log('⏰ [AppContext] Timeout setup - asumiendo configurado')
          resolve(true)
        }, 2000) // Timeout rápido de 2s
      })

      const queryPromise = supabase
        .from('organizations')
        .select('id')
        .limit(1)
        .maybeSingle()
        .then(({ data, error }) => {
          if (error) {
            console.log('🔧 [AppContext] Error setup, asumiendo configurado:', error.message)
            return true
          }
          const setupComplete = data !== null
          console.log('🔧 [AppContext] Setup verificado:', setupComplete)
          return setupComplete
        })

      const systemIsSetup = await Promise.race([queryPromise, timeoutPromise])
      setIsSetup(systemIsSetup)
    } catch (error) {
      console.warn('⚠️ [AppContext] Error verificando setup, asumiendo configurado:', error)
      setIsSetup(true) // Fallback seguro
    } finally {
      setSetupLoading(false)
    }
  }

  // Enriquecimiento de perfil en segundo plano
  const enrichUserProfileAsync = async (authUser: User, userSession: Session) => {
    if (profileEnrichmentInProgress.current) {
      console.log('👤 [AppContext] Enriquecimiento ya en progreso')
      return
    }

    try {
      profileEnrichmentInProgress.current = true
      console.log('👤 [AppContext] Enriqueciendo perfil en segundo plano:', authUser.id)
      
      const { data, error } = await Promise.race([
        supabase
          .from('users')
          .select('role, org_id')
          .eq('id', authUser.id)
          .single(),
        new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error('TIMEOUT')), 3000)
        })
      ])

      if (!error && data) {
        const enrichedUser: AuthUser = {
          ...authUser,
          role: data.role as UserRole,
          org_id: data.org_id
        }
        
        console.log('✅ [AppContext] Perfil enriquecido:', { role: data.role, org_id: data.org_id })
        setUser(enrichedUser)
      } else {
        console.log('⚠️ [AppContext] Manteniendo usuario básico:', error?.message || 'Sin datos')
      }
    } catch (error: any) {
      console.log('⚠️ [AppContext] Error enriqueciendo perfil, manteniendo básico:', error.message)
    } finally {
      profileEnrichmentInProgress.current = false
    }
  }

  // Acciones de autenticación simplificadas
  const signIn = async (email: string, password: string) => {
    console.log('🔐 [AppContext] Iniciando sesión para:', email)
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    
    if (error) {
      console.error('❌ [AppContext] Error en signIn:', error.message)
      throw error
    }
    
    console.log('✅ [AppContext] Sign in exitoso')
  }

  const signUp = async (email: string, password: string, role: UserRole, orgId: string) => {
    console.log('📝 [AppContext] Registrando usuario:', email)
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })
    if (error) {
      console.error('❌ [AppContext] Error en signUp:', error.message)
      throw error
    }

    if (data.user) {
      console.log('👤 [AppContext] Creando perfil para:', data.user.id)
      const { error: profileError } = await supabase
        .from('users')
        .insert({
          id: data.user.id,
          email,
          role,
          org_id: orgId
        })
      if (profileError) {
        console.error('❌ [AppContext] Error creando perfil:', profileError.message)
        throw profileError
      }
    }
  }

  const signOut = async () => {
    console.log('🚪 [AppContext] Cerrando sesión')
    
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error('❌ [AppContext] Error en signOut:', error.message)
    }
    
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
