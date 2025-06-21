
import React, { createContext, useContext, useEffect, useState, useRef } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/integrations/supabase/client'

type UserRole = 'partner' | 'area_manager' | 'senior' | 'junior' | 'finance' | 'client'

interface AuthUser extends User {
  role?: UserRole
  org_id?: string
}

interface AuthContextType {
  user: AuthUser | null
  session: Session | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, role: UserRole, orgId: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Timeout más agresivo para consultas de perfil
const PROFILE_FETCH_TIMEOUT = 3000 // 3 segundos
const MAX_RETRIES = 2

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const fetchingProfile = useRef<string | null>(null)
  const lastAuthEvent = useRef<string | null>(null)
  const initializationComplete = useRef(false)

  useEffect(() => {
    let isMounted = true
    let initTimeout: NodeJS.Timeout

    const initializeAuth = async () => {
      try {
        console.log('🔐 [AuthContext] Inicializando con timeout de 5s...')
        
        // Timeout de seguridad para inicialización
        initTimeout = setTimeout(() => {
          if (!initializationComplete.current && isMounted) {
            console.warn('⚠️ [AuthContext] Timeout de inicialización - usando sesión básica')
            setLoading(false)
            initializationComplete.current = true
          }
        }, 5000)

        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('❌ [AuthContext] Error obteniendo sesión:', error.message)
          if (isMounted && !initializationComplete.current) {
            setSession(null)
            setUser(null)
            setLoading(false)
            initializationComplete.current = true
          }
          return
        }

        console.log('📋 [AuthContext] Sesión inicial:', session ? 'Encontrada' : 'No encontrada')
        
        if (isMounted && !initializationComplete.current) {
          setSession(session)
          if (session?.user) {
            console.log('👤 [AuthContext] Usuario en sesión:', session.user.id)
            await fetchUserProfileWithTimeout(session.user)
          } else {
            console.log('🚫 [AuthContext] Sin usuario en sesión')
            setUser(null)
            setLoading(false)
            initializationComplete.current = true
          }
        }
      } catch (error) {
        console.error('❌ [AuthContext] Error crítico en inicialización:', error)
        if (isMounted && !initializationComplete.current) {
          setUser(null)
          setSession(null)
          setLoading(false)
          initializationComplete.current = true
        }
      } finally {
        if (initTimeout) clearTimeout(initTimeout)
      }
    }

    // Listener para cambios de auth con deduplicación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      const eventKey = `${event}-${session?.user?.id || 'null'}`
      
      // Evitar procesamiento duplicado del mismo evento
      if (lastAuthEvent.current === eventKey) {
        console.log('🔄 [AuthContext] Evento duplicado ignorado:', event)
        return
      }
      
      lastAuthEvent.current = eventKey
      console.log('🔄 [AuthContext] Cambio de estado:', event)
      
      if (isMounted) {
        setSession(session)
        if (session?.user) {
          console.log('👤 [AuthContext] Nuevo usuario autenticado:', session.user.id)
          await fetchUserProfileWithTimeout(session.user)
        } else {
          console.log('🚫 [AuthContext] Usuario desautenticado')
          setUser(null)
          setLoading(false)
        }
      }
    })

    initializeAuth()

    return () => {
      isMounted = false
      if (initTimeout) clearTimeout(initTimeout)
      subscription.unsubscribe()
    }
  }, [])

  const fetchUserProfileWithTimeout = async (authUser: User, retryCount = 0): Promise<void> => {
    // Evitar consultas duplicadas para el mismo usuario
    if (fetchingProfile.current === authUser.id) {
      console.log('👤 [AuthContext] Consulta de perfil ya en curso para:', authUser.id)
      return
    }

    try {
      fetchingProfile.current = authUser.id
      console.log(`👤 [AuthContext] Consultando perfil (intento ${retryCount + 1}/${MAX_RETRIES + 1}):`, authUser.id)
      
      // Implementar timeout para la consulta
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), PROFILE_FETCH_TIMEOUT)

      try {
        const { data, error } = await supabase
          .from('users')
          .select('role, org_id')
          .eq('id', authUser.id)
          .abortSignal(controller.signal)
          .single()

        clearTimeout(timeoutId)

        if (error) {
          throw error
        }

        if (data) {
          console.log('✅ [AuthContext] Perfil consultado exitosamente:', { role: data.role, org_id: data.org_id })
          setUser({
            ...authUser,
            role: data.role as UserRole,
            org_id: data.org_id
          })
        } else {
          console.log('⚠️ [AuthContext] No se encontró perfil, usando usuario básico')
          setUser(authUser as AuthUser)
        }
      } catch (fetchError: any) {
        clearTimeout(timeoutId)
        
        if (fetchError.name === 'AbortError') {
          console.warn('⏰ [AuthContext] Timeout en consulta de perfil')
          throw new Error('Timeout en consulta de perfil')
        }
        throw fetchError
      }
    } catch (error: any) {
      console.error(`❌ [AuthContext] Error en fetchUserProfile (intento ${retryCount + 1}):`, error.message)
      
      // Retry logic
      if (retryCount < MAX_RETRIES && error.message !== 'Timeout en consulta de perfil') {
        console.log(`🔄 [AuthContext] Reintentando consulta de perfil en 1s...`)
        setTimeout(() => {
          fetchUserProfileWithTimeout(authUser, retryCount + 1)
        }, 1000)
        return
      }
      
      // Si fallan todos los intentos, usar usuario básico
      console.log('⚠️ [AuthContext] Usando usuario básico tras fallos en consulta de perfil')
      setUser(authUser as AuthUser)
    } finally {
      fetchingProfile.current = null
      if (!initializationComplete.current) {
        console.log('🏁 [AuthContext] Finalizando carga de perfil')
        setLoading(false)
        initializationComplete.current = true
      }
    }
  }

  const signIn = async (email: string, password: string) => {
    console.log('🔐 [AuthContext] Iniciando sesión para:', email)
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) {
      console.error('❌ [AuthContext] Error en signIn:', error.message)
      throw error
    }
  }

  const signUp = async (email: string, password: string, role: UserRole, orgId: string) => {
    console.log('📝 [AuthContext] Registrando usuario:', email)
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })
    if (error) {
      console.error('❌ [AuthContext] Error en signUp:', error.message)
      throw error
    }

    if (data.user) {
      console.log('👤 [AuthContext] Creando perfil para:', data.user.id)
      const { error: profileError } = await supabase
        .from('users')
        .insert({
          id: data.user.id,
          email,
          role,
          org_id: orgId
        })
      if (profileError) {
        console.error('❌ [AuthContext] Error creando perfil:', profileError.message)
        throw profileError
      }
    }
  }

  const signOut = async () => {
    console.log('🚪 [AuthContext] Cerrando sesión')
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error('❌ [AuthContext] Error en signOut:', error.message)
      throw error
    }
  }

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
