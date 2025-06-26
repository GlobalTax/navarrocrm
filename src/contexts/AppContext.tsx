
import React, { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/integrations/supabase/client'
import { AppState, AuthUser, UserRole } from './types'
import { useAuthActions } from './hooks/useAuthActions'

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

  const { signIn, signUp, signOut: baseSignOut } = useAuthActions()

  useEffect(() => {
    console.log('🚀 [AppContext] Inicializando autenticación...')
    
    // Función para manejar cambios de autenticación
    const handleAuthChange = async (event: string, session: Session | null) => {
      console.log('🔄 [AppContext] Auth event:', event, session ? 'con sesión' : 'sin sesión')
      
      setSession(session)
      
      if (!session) {
        setUser(null)
        setAuthLoading(false)
        return
      }

      // Usuario básico primero
      const basicUser = session.user as AuthUser
      setUser(basicUser)
      setAuthLoading(false)
      
      // Intentar enriquecer perfil en segundo plano
      try {
        console.log('🔍 [AppContext] Enriqueciendo perfil para usuario:', session.user.id)
        
        const { data: profile, error } = await supabase
          .from('users')
          .select('role, org_id')
          .eq('id', session.user.id)
          .single()

        if (error) {
          console.error('❌ [AppContext] Error obteniendo perfil:', {
            error: error,
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code
          })
          
          // Si el usuario no existe en la tabla users, mantener usuario básico
          if (error.code === 'PGRST116') {
            console.warn('⚠️ [AppContext] Usuario no encontrado en tabla users, usando perfil básico')
          }
          return
        }

        if (profile) {
          const enrichedUser: AuthUser = {
            ...session.user,
            role: profile.role as UserRole,
            org_id: profile.org_id
          }
          setUser(enrichedUser)
          console.log('✅ [AppContext] Perfil enriquecido:', {
            role: profile.role,
            org_id: profile.org_id
          })
        }
      } catch (error) {
        console.error('❌ [AppContext] Error crítico enriqueciendo perfil:', error)
      }
    }

    // Configurar listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthChange)

    // Verificar sesión inicial
    const initializeAuth = async () => {
      try {
        console.log('🔍 [AppContext] Verificando sesión inicial...')
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('❌ [AppContext] Error obteniendo sesión inicial:', error)
        }
        
        await handleAuthChange('initial', session)
      } catch (error) {
        console.error('❌ [AppContext] Error inicializando autenticación:', error)
        setAuthLoading(false)
      }
    }

    initializeAuth()

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const signOut = async () => {
    try {
      await baseSignOut()
      setUser(null)
      setSession(null)
    } catch (error) {
      console.error('❌ Error cerrando sesión:', error)
    }
  }

  const value: AppState = {
    user,
    session,
    authLoading,
    isSetup: true,
    setupLoading: false,
    isInitializing: authLoading,
    signIn,
    signUp,
    signOut,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}
