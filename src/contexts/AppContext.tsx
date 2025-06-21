
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

// Caché global optimizado
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
  const profileFetchInProgress = useRef<Set<string>>(new Set())

  // Estado combinado de carga
  const isInitializing = authLoading || setupLoading

  useEffect(() => {
    if (initializationStarted.current) return
    initializationStarted.current = true

    console.log('🚀 [AppContext] Inicializando aplicación...')
    
    // Verificar y limpiar sesiones corruptas
    cleanCorruptedSessions()
    
    // Inicializar verificación de setup con caché
    checkSystemSetup()
    
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
        await handleUserProfile(session.user, session)
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
        await handleUserProfile(session.user, session)
      } else {
        setAuthLoading(false)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const isValidSession = (session: Session): boolean => {
    try {
      // Verificar que la sesión tenga los campos básicos
      if (!session.access_token || !session.user?.id) {
        return false
      }
      
      // Verificar que no esté expirada (con margen de 5 minutos)
      const now = Math.floor(Date.now() / 1000)
      const expiresAt = session.expires_at || 0
      if (expiresAt > 0 && (expiresAt - now) < 300) { // 5 minutos de margen
        console.log('⏰ [AppContext] Sesión expira pronto o ya expiró')
        return false
      }
      
      return true
    } catch (error) {
      console.error('❌ [AppContext] Error validando sesión:', error)
      return false
    }
  }

  const cleanCorruptedSessions = async () => {
    try {
      console.log('🧹 [AppContext] Limpiando sesiones corruptas...')
      
      // Limpiar localStorage de Supabase
      const supabaseKeys = Object.keys(localStorage).filter(key => 
        key.startsWith('sb-') || key.includes('supabase')
      )
      
      supabaseKeys.forEach(key => {
        localStorage.removeItem(key)
        console.log('🗑️ [AppContext] Eliminado:', key)
      })
      
      // Limpiar cachés
      profileCache.clear()
      setupCache.isSetup = null
      setupCache.timestamp = 0
      
      console.log('✅ [AppContext] Limpieza completada')
    } catch (error) {
      console.error('❌ [AppContext] Error limpiando sesiones:', error)
    }
  }

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
      
      // Consulta con timeout mejorado usando Promise.race
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('TIMEOUT')), 8000)
      })

      const queryPromise = supabase
        .from('organizations')
        .select('id')
        .limit(1)
        .maybeSingle()

      try {
        const result = await Promise.race([queryPromise, timeoutPromise])
        const { data, error } = result

        const systemIsSetup = !error && data !== null
        
        // Actualizar caché
        setupCache.isSetup = systemIsSetup
        setupCache.timestamp = now
        
        console.log('✅ [AppContext] Setup verificado:', systemIsSetup)
        setIsSetup(systemIsSetup)
      } catch (fetchError: any) {
        if (fetchError.message === 'TIMEOUT') {
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
    // Evitar consultas duplicadas
    if (profileFetchInProgress.current.has(authUser.id)) {
      console.log('👤 [AppContext] Consulta de perfil ya en progreso para:', authUser.id)
      return
    }

    try {
      profileFetchInProgress.current.add(authUser.id)
      
      // Verificar caché de perfil
      const cached = profileCache.get(authUser.id)
      if (cached && (Date.now() - cached.timestamp) < 30000) { // 30 segundos
        console.log('👤 [AppContext] Usando perfil en caché para:', authUser.id)
        setUser(cached.user)
        setAuthLoading(false)
        return
      }

      console.log('👤 [AppContext] Consultando perfil:', authUser.id)
      
      // Timeout mejorado usando Promise.race
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('TIMEOUT')), 8000) // Aumentado a 8 segundos
      })

      const queryPromise = supabase
        .from('users')
        .select('role, org_id')
        .eq('id', authUser.id)
        .single()

      try {
        const result = await Promise.race([queryPromise, timeoutPromise])
        const { data, error } = result

        if (error) {
          console.warn('⚠️ [AppContext] Error consultando perfil:', error.message)
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
        if (fetchError.message === 'TIMEOUT') {
          console.warn('⏰ [AppContext] Timeout en consulta de perfil')
        }
        
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
      profileFetchInProgress.current.delete(authUser.id)
      setAuthLoading(false)
    }
  }

  const signIn = async (email: string, password: string) => {
    console.log('🔐 [AppContext] Iniciando sesión para:', email)
    
    // Limpiar estado previo
    setAuthLoading(true)
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      if (error) {
        console.error('❌ [AppContext] Error en signIn:', error.message)
        
        // Si hay error de credenciales, limpiar sesiones corruptas
        if (error.message.includes('Invalid') || error.message.includes('credentials')) {
          await cleanCorruptedSessions()
        }
        
        throw error
      }
      
      console.log('✅ [AppContext] Sign in exitoso')
    } catch (error) {
      setAuthLoading(false)
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
    
    // Limpiar cachés antes del sign out
    profileCache.clear()
    setupCache.isSetup = null
    setupCache.timestamp = 0
    
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error('❌ [AppContext] Error en signOut:', error.message)
    }
    
    // Limpiar estado local
    setUser(null)
    setSession(null)
    
    // Limpiar localStorage como medida adicional
    await cleanCorruptedSessions()
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
