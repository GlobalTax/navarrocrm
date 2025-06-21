
import React, { createContext, useContext, useEffect, useState } from 'react'
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

  useEffect(() => {
    let isMounted = true
    let timeoutId: NodeJS.Timeout

    // Timeout de emergencia para evitar carga infinita
    const emergencyTimeout = setTimeout(() => {
      console.error('🚨 TIMEOUT EMERGENCIA: AuthContext tardó más de 10 segundos')
      if (isMounted) {
        setLoading(false)
        setUser(null)
        setSession(null)
      }
    }, 10000)

    const initializeAuth = async () => {
      try {
        console.log('🔐 [AuthContext] Inicializando...')
        
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('❌ [AuthContext] Error obteniendo sesión:', error.message)
          if (isMounted) {
            setSession(null)
            setUser(null)
            setLoading(false)
          }
          return
        }

        console.log('📋 [AuthContext] Sesión inicial:', session ? 'Encontrada' : 'No encontrada')
        
        if (isMounted) {
          setSession(session)
          if (session?.user) {
            console.log('👤 [AuthContext] Usuario en sesión:', session.user.id)
            await fetchUserProfile(session.user)
          } else {
            console.log('🚫 [AuthContext] Sin usuario en sesión')
            setUser(null)
            setLoading(false)
          }
        }
      } catch (error) {
        console.error('❌ [AuthContext] Error crítico en inicialización:', error)
        if (isMounted) {
          setUser(null)
          setSession(null)
          setLoading(false)
        }
      }
    }

    // Listener para cambios de auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔄 [AuthContext] Cambio de estado:', event)
      
      if (isMounted) {
        setSession(session)
        if (session?.user) {
          console.log('👤 [AuthContext] Nuevo usuario autenticado:', session.user.id)
          await fetchUserProfile(session.user)
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
      clearTimeout(emergencyTimeout)
      if (timeoutId) clearTimeout(timeoutId)
      subscription.unsubscribe()
    }
  }, [])

  const fetchUserProfile = async (authUser: User) => {
    try {
      console.log('👤 [AuthContext] Consultando perfil para:', authUser.id)
      
      // Timeout específico para la consulta del perfil
      const profileTimeout = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Timeout consultando perfil')), 5000)
      })

      const profileQuery = supabase
        .from('users')
        .select('role, org_id')
        .eq('id', authUser.id)
        .single()

      const { data, error } = await Promise.race([profileQuery, profileTimeout])

      if (error) {
        console.error('❌ [AuthContext] Error consultando perfil:', error.message)
        // Si falla la consulta del perfil, usar usuario básico
        console.log('⚠️ [AuthContext] Usando usuario básico sin perfil extendido')
        setUser(authUser as AuthUser)
      } else if (data) {
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
    } catch (error) {
      console.error('❌ [AuthContext] Error crítico en fetchUserProfile:', error)
      // En caso de error crítico, usar usuario básico
      setUser(authUser as AuthUser)
    } finally {
      console.log('🏁 [AuthContext] Finalizando carga de perfil')
      setLoading(false)
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
