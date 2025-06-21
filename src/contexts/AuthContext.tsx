
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

    // Get initial session
    const initializeAuth = async () => {
      try {
        console.log('🔐 Inicializando autenticación...')
        
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('❌ Error obteniendo sesión inicial:', error)
          if (isMounted) {
            setLoading(false)
          }
          return
        }

        console.log('📋 Sesión inicial:', session ? 'Encontrada' : 'No encontrada')
        
        if (isMounted) {
          setSession(session)
          if (session?.user) {
            await fetchUserProfile(session.user)
          } else {
            setUser(null)
            setLoading(false)
          }
        }
      } catch (error) {
        console.error('❌ Error en inicialización de auth:', error)
        if (isMounted) {
          setUser(null)
          setSession(null)
          setLoading(false)
        }
      }
    }

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔄 Cambio de auth:', event, session ? 'Session activa' : 'Sin session')
      
      if (isMounted) {
        setSession(session)
        if (session?.user) {
          await fetchUserProfile(session.user)
        } else {
          setUser(null)
          setLoading(false)
        }
      }
    })

    initializeAuth()

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [])

  const fetchUserProfile = async (authUser: User) => {
    try {
      console.log('👤 Obteniendo perfil de usuario:', authUser.id)
      
      const { data, error } = await supabase
        .from('users')
        .select('role, org_id')
        .eq('id', authUser.id)
        .single()

      if (error) {
        console.error('❌ Error obteniendo perfil:', error)
        // Si no se puede obtener el perfil, usar el usuario básico
        setUser(authUser as AuthUser)
      } else if (data) {
        console.log('✅ Perfil obtenido:', data)
        setUser({
          ...authUser,
          role: data.role as UserRole,
          org_id: data.org_id
        })
      } else {
        console.log('⚠️ No se encontró perfil, usando usuario básico')
        setUser(authUser as AuthUser)
      }
    } catch (error) {
      console.error('❌ Error en fetchUserProfile:', error)
      setUser(authUser as AuthUser)
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) throw error
  }

  const signUp = async (email: string, password: string, role: UserRole, orgId: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })
    if (error) throw error

    if (data.user) {
      const { error: profileError } = await supabase
        .from('users')
        .insert({
          id: data.user.id,
          email,
          role,
          org_id: orgId
        })
      if (profileError) throw profileError
    }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
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
