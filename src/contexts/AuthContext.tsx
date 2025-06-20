
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
    console.log('Inicializando AuthProvider...')
    
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Sesión inicial:', session?.user?.id || 'No hay sesión')
      setSession(session)
      if (session?.user) {
        fetchUserProfile(session.user.id)
      } else {
        setLoading(false)
      }
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Cambio de estado de auth:', event, session?.user?.id || 'No user')
      setSession(session)
      if (session?.user) {
        setTimeout(() => {
          fetchUserProfile(session.user.id)
        }, 0)
      } else {
        setUser(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const fetchUserProfile = async (userId: string) => {
    try {
      console.log('Obteniendo perfil para usuario:', userId)
      const { data, error } = await supabase
        .from('users')
        .select('role, org_id')
        .eq('id', userId)
        .maybeSingle()

      if (error) {
        console.error('Error obteniendo perfil:', error)
        // Si no se puede obtener el perfil, aún así mantener la sesión de auth
        if (session?.user) {
          setUser(session.user as AuthUser)
        }
        setLoading(false)
        return
      }

      if (data && session?.user) {
        console.log('Datos del perfil:', data)
        setUser({
          ...session.user,
          role: data.role as UserRole,
          org_id: data.org_id
        })
      } else if (session?.user) {
        // Si no hay datos de perfil pero sí sesión de auth
        setUser(session.user as AuthUser)
      }
    } catch (error) {
      console.error('Error en fetchUserProfile:', error)
      // En caso de error, mantener la sesión de auth básica
      if (session?.user) {
        setUser(session.user as AuthUser)
      }
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (email: string, password: string) => {
    console.log('Intentando iniciar sesión:', email)
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) {
      console.error('Error en signIn:', error)
      throw error
    }
  }

  const signUp = async (email: string, password: string, role: UserRole, orgId: string) => {
    console.log('Intentando registrar usuario:', email, 'con rol:', role)
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`
      }
    })
    if (error) {
      console.error('Error en signUp:', error)
      throw error
    }

    if (data.user) {
      console.log('Creando perfil para:', data.user.id)
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
        console.error('Error creando perfil:', profileError)
        throw profileError
      }
    }
  }

  const signOut = async () => {
    console.log('Cerrando sesión')
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error('Error en signOut:', error)
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
