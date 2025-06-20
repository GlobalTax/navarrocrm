
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
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

// Cache para perfil de usuario
const profileCache = new Map<string, { data: any, timestamp: number }>()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutos

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchUserProfile = useCallback(async (userId: string) => {
    try {
      // Verificar cache primero
      const cached = profileCache.get(userId)
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        console.log('📦 Usando perfil de usuario desde cache')
        return cached.data
      }

      console.log('👤 Obteniendo perfil para usuario:', userId)
      
      const { data, error } = await Promise.race([
        supabase
          .from('users')
          .select('role, org_id')
          .eq('id', userId)
          .maybeSingle(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Profile fetch timeout')), 3000)
        )
      ]) as any

      if (error) {
        console.warn('⚠️ Error obteniendo perfil de usuario:', error.message)
        return null
      }

      // Guardar en cache
      if (data) {
        profileCache.set(userId, { data, timestamp: Date.now() })
      }

      return data
    } catch (error) {
      console.error('💥 Error en fetchUserProfile:', error)
      return null
    }
  }, [])

  useEffect(() => {
    console.log('🚀 Inicializando AuthProvider...')
    
    let mounted = true

    const initializeAuth = async () => {
      try {
        // Get initial session with timeout
        const { data: { session }, error } = await Promise.race([
          supabase.auth.getSession(),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Session timeout')), 5000)
          )
        ]) as any

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
          const profileData = await fetchUserProfile(session.user.id)
          
          if (mounted) {
            if (profileData) {
              console.log('✅ Perfil obtenido exitosamente:', { role: profileData.role, org_id: profileData.org_id })
              setUser({
                ...session.user,
                role: profileData.role as UserRole,
                org_id: profileData.org_id
              })
            } else {
              console.log('📝 Sin datos de perfil adicional, usando sesión básica')
              setUser(session.user as AuthUser)
            }
          }
        }
      } catch (error) {
        console.error('💥 Error en inicialización de auth:', error)
        if (mounted) {
          setLoading(false)
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    initializeAuth()

    // Listen for auth changes con debounce
    let authChangeTimeout: NodeJS.Timeout | null = null
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return
      
      // Clear previous timeout
      if (authChangeTimeout) {
        clearTimeout(authChangeTimeout)
      }
      
      // Debounce auth state changes
      authChangeTimeout = setTimeout(async () => {
        if (!mounted) return
        
        const userId = session?.user?.id
        console.log('🔄 Cambio de estado de auth:', event, userId ? `Usuario: ${userId}` : 'No user')
        setSession(session)
        
        if (session?.user) {
          const profileData = await fetchUserProfile(session.user.id)
          
          if (mounted) {
            if (profileData) {
              setUser({
                ...session.user,
                role: profileData.role as UserRole,
                org_id: profileData.org_id
              })
            } else {
              setUser(session.user as AuthUser)
            }
          }
        } else {
          setUser(null)
        }
      }, 100) // 100ms debounce
    })

    return () => {
      mounted = false
      if (authChangeTimeout) {
        clearTimeout(authChangeTimeout)
      }
      subscription.unsubscribe()
    }
  }, [fetchUserProfile])

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
    // Limpiar cache al cerrar sesión
    profileCache.clear()
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
