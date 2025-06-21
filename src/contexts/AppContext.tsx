
import React, { createContext, useContext, useEffect, useState, useRef } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/integrations/supabase/client'

type UserRole = 'partner' | 'area_manager' | 'senior' | 'junior' | 'finance' | 'client'

interface AuthUser extends User {
  role?: UserRole
  org_id?: string
}

interface AppState {
  // Auth state
  user: AuthUser | null
  session: Session | null
  authLoading: boolean
  
  // System setup state
  isSetup: boolean | null
  setupLoading: boolean
  
  // Combined loading state
  isInitializing: boolean
  
  // Actions
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, role: UserRole, orgId: string) => Promise<void>
  signOut: () => Promise<void>
}

const AppContext = createContext<AppState | undefined>(undefined)

// Caché global para evitar consultas repetidas
const setupCache = {
  isSetup: null as boolean | null,
  timestamp: 0,
  CACHE_DURATION: 60000 // 1 minuto
}

const profileCache = new Map<string, { user: AuthUser, timestamp: number }>()

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

  // Estado combinado de carga
  const isInitializing = authLoading || setupLoading

  useEffect(() => {
    if (initializationStarted.current) return
    initializationStarted.current = true

    console.log('🚀 [AppContext] Inicializando aplicación...')
    
    // Inicializar verificación de setup con caché
    checkSystemSetup()
    
    // Configurar listener de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      const eventKey = `${event}-${session?.user?.id || 'null'}`
      
      // Evitar procesamiento duplicado
      if (lastAuthEvent.current === eventKey) {
        console.log('🔄 [AppContext] Evento duplicado ignorado:', event)
        return
      }
      
      lastAuthEvent.current = eventKey
      console.log('🔄 [AppContext] Cambio de estado auth:', event)
      
      setSession(session)
      
      if (session?.user) {
        await handleUserProfile(session.user, session)
      } else {
        setUser(null)
        setAuthLoading(false)
      }
    })

    // Obtener sesión inicial
    supabase.auth.getSession().then(async ({ data: { session }, error }) => {
      if (error) {
        console.error('❌ [AppContext] Error obteniendo sesión inicial:', error)
        setAuthLoading(false)
        return
      }

      console.log('📋 [AppContext] Sesión inicial:', session ? 'Encontrada' : 'No encontrada')
      setSession(session)
      
      if (session?.user) {
        await handleUserProfile(session.user, session)
      } else {
        setAuthLoading(false)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const checkSystemSetup = async () => {
    try {
      // Verificar caché primero
      const now = Date.now()
      if (setupCache.isSetup !== null && (now - setupCache.timestamp) < setupCache.CACHE_DURATION) {
        console.log('📋 [AppContext] Usando caché para setup:', setupCache.isSetup)
        setIsSetup(setupCache.isSetup)
        setSetupLoading(false)
        return
      }

      console.log('🔧 [AppContext] Verificando configuración del sistema...')
      setSetupLoading(true)
      
      // Consulta optimizada con timeout
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000)

      try {
        const { data, error } = await supabase
          .from('organizations')
          .select('id')
          .limit(1)
          .abortSignal(controller.signal)
          .maybeSingle()

        clearTimeout(timeoutId)

        const systemIsSetup = !error && data !== null
        
        // Actualizar caché
        setupCache.isSetup = systemIsSetup
        setupCache.timestamp = now
        
        console.log('✅ [AppContext] Setup verificado:', systemIsSetup)
        setIsSetup(systemIsSetup)
      } catch (fetchError: any) {
        clearTimeout(timeoutId)
        
        if (fetchError.name === 'AbortError') {
          console.warn('⏰ [AppContext] Timeout en verificación setup - asumiendo configurado')
          setupCache.isSetup = true
          setupCache.timestamp = now
          setIsSetup(true)
        } else {
          throw fetchError
        }
      }
    } catch (error: any) {
      console.error('❌ [AppContext] Error verificando setup:', error)
      // Fallback seguro
      setupCache.isSetup = true
      setupCache.timestamp = Date.now()
      setIsSetup(true)
    } finally {
      setSetupLoading(false)
    }
  }

  const handleUserProfile = async (authUser: User, userSession: Session) => {
    try {
      // Verificar caché de perfil
      const cached = profileCache.get(authUser.id)
      if (cached && (Date.now() - cached.timestamp) < 30000) { // 30 segundos
        console.log('👤 [AppContext] Usando perfil en caché para:', authUser.id)
        setUser(cached.user)
        setAuthLoading(false)
        return
      }

      console.log('👤 [AppContext] Consultando perfil:', authUser.id)
      
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 3000)

      try {
        const { data, error } = await supabase
          .from('users')
          .select('role, org_id')
          .eq('id', authUser.id)
          .abortSignal(controller.signal)
          .single()

        clearTimeout(timeoutId)

        if (error) {
          console.warn('⚠️ [AppContext] Error consultando perfil, usando usuario básico:', error.message)
          throw error
        }

        const enrichedUser: AuthUser = {
          ...authUser,
          role: data.role as UserRole,
          org_id: data.org_id
        }

        // Actualizar caché
        profileCache.set(authUser.id, {
          user: enrichedUser,
          timestamp: Date.now()
        })

        console.log('✅ [AppContext] Perfil cargado:', { role: data.role, org_id: data.org_id })
        setUser(enrichedUser)
      } catch (fetchError: any) {
        clearTimeout(timeoutId)
        
        // Usar usuario básico como fallback
        console.log('⚠️ [AppContext] Usando usuario básico como fallback')
        const fallbackUser = authUser as AuthUser
        
        profileCache.set(authUser.id, {
          user: fallbackUser,
          timestamp: Date.now()
        })
        
        setUser(fallbackUser)
      }
    } catch (error: any) {
      console.error('❌ [AppContext] Error manejando perfil:', error)
      setUser(authUser as AuthUser)
    } finally {
      setAuthLoading(false)
    }
  }

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
    // Limpiar cachés
    profileCache.clear()
    setupCache.isSetup = null
    setupCache.timestamp = 0
    
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error('❌ [AppContext] Error en signOut:', error.message)
      throw error
    }
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
