
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
    console.log('🚀 Inicializando AuthProvider...')
    
    let mounted = true

    // Get initial session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (!mounted) return
      
      if (error) {
        console.error('❌ Error obteniendo sesión inicial:', error.message)
        setLoading(false)
        return
      }

      const userId = session?.user?.id
      console.log('🔑 Sesión inicial:', userId ? `Usuario: ${userId}` : 'No hay sesión')
      setSession(session)
      if (session?.user) {
        // Usar setTimeout para evitar problemas de recursión
        setTimeout(() => {
          if (mounted) {
            fetchUserProfile(session.user.id)
          }
        }, 0)
      } else {
        setLoading(false)
      }
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return
      
      const userId = session?.user?.id
      console.log('🔄 Cambio de estado de auth:', event, userId ? `Usuario: ${userId}` : 'No user')
      setSession(session)
      if (session?.user) {
        // Usar setTimeout para evitar problemas de recursión en onAuthStateChange
        setTimeout(() => {
          if (mounted) {
            fetchUserProfile(session.user.id)
          }
        }, 0)
      } else {
        setUser(null)
        setLoading(false)
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const fetchUserProfile = async (userId: string) => {
    try {
      console.log('👤 Obteniendo perfil para usuario:', userId)
      
      // Añadir timeout y retry para la consulta de perfil
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), 5000)
      )
      
      const queryPromise = supabase
        .from('users')
        .select('role, org_id')
        .eq('id', userId)
        .maybeSingle()

      const { data, error } = await Promise.race([queryPromise, timeoutPromise]) as any

      if (error) {
        console.warn('⚠️ Error obteniendo perfil de usuario:', error.message)
        // Si no se puede obtener el perfil, mantener la sesión de auth básica
        if (session?.user) {
          console.log('📝 Manteniendo sesión básica sin perfil adicional')
          setUser(session.user as AuthUser)
        }
        setLoading(false)
        return
      }

      if (data && session?.user) {
        console.log('✅ Perfil obtenido exitosamente:', { role: data.role, org_id: data.org_id })
        setUser({
          ...session.user,
          role: data.role as UserRole,
          org_id: data.org_id
        })
      } else if (session?.user) {
        console.log('📝 Sin datos de perfil adicional, usando sesión básica')
        setUser(session.user as AuthUser)
      }
    } catch (error) {
      if (error instanceof Error && error.message === 'Timeout') {
        console.error('⏰ Timeout obteniendo perfil de usuario')
      } else {
        console.error('💥 Error inesperado en fetchUserProfile:', error)
      }
      // En caso de error, mantener la sesión de auth básica
      if (session?.user) {
        setUser(session.user as AuthUser)
      }
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (email: string, password: string) => {
    console.log('🔐 Intentando iniciar sesión:', email)
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) {
      console.error('❌ Error en signIn:', error.message)
      throw error
    }
    console.log('✅ Inicio de sesión exitoso')
  }

  const signUp = async (email: string, password: string, role: UserRole, orgId: string) => {
    console.log('📝 Intentando registrar usuario:', email, 'con rol:', role)
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`
      }
    })
    if (error) {
      console.error('❌ Error en signUp:', error.message)
      throw error
    }

    if (data.user) {
      console.log('👤 Creando perfil para:', data.user.id)
      // Create user profile
      const { error: profileError } = await supabase
        .from('users')
        .insert({
          id: data.user.id,
          email,
          role,
          org_id: orgId
        })
      if (profileError) {
        console.error('❌ Error creando perfil:', profileError.message)
        throw profileError
      }
      console.log('✅ Usuario y perfil creados exitosamente')
    }
  }

  const signOut = async () => {
    console.log('🚪 Cerrando sesión')
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error('❌ Error en signOut:', error.message)
      throw error
    }
    console.log('✅ Sesión cerrada exitosamente')
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
