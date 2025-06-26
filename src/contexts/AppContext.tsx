
import React, { createContext, useContext, useEffect, useState, useRef } from 'react'
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
  
  // Control de inicialización único
  const initRef = useRef(false)
  const enrichmentInProgress = useRef(false)

  const { signIn, signUp, signOut: baseSignOut } = useAuthActions()

  // Función simplificada para enriquecer perfil
  const enrichUserProfile = async (basicUser: User) => {
    if (enrichmentInProgress.current) return
    enrichmentInProgress.current = true

    try {
      const { data: profile, error } = await supabase
        .from('users')
        .select('role, org_id, email')
        .eq('id', basicUser.id)
        .single()

      if (error) {
        console.log('⚠️ [AppContext] Error al obtener perfil:', error.message)
        // Usar usuario básico como fallback
        const fallbackUser: AuthUser = {
          ...basicUser,
          role: 'junior' as UserRole,
          org_id: undefined
        }
        setUser(fallbackUser)
        return
      }

      if (profile) {
        const enrichedUser: AuthUser = {
          ...basicUser,
          role: profile.role as UserRole,
          org_id: profile.org_id
        }
        
        console.log('✅ [AppContext] Usuario enriquecido:', enrichedUser.email)
        setUser(enrichedUser)
      }
    } catch (error) {
      console.error('❌ [AppContext] Error crítico:', error)
      // Fallback seguro
      const fallbackUser: AuthUser = {
        ...basicUser,
        role: 'junior' as UserRole,
        org_id: undefined
      }
      setUser(fallbackUser)
    } finally {
      enrichmentInProgress.current = false
    }
  }

  // Función de limpieza de estado
  const clearAuthState = () => {
    console.log('🧹 [AppContext] Limpiando estado')
    setUser(null)
    setSession(null)
    enrichmentInProgress.current = false
  }

  // Inicialización única y estable
  useEffect(() => {
    if (initRef.current) return
    initRef.current = true

    console.log('🚀 [AppContext] Inicializando autenticación...')
    
    // Configurar listener de cambios de auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔄 [AppContext] Auth event:', event)
      
      if (event === 'SIGNED_OUT' || !session) {
        clearAuthState()
        setAuthLoading(false)
        return
      }

      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        setSession(session)
        
        if (session?.user) {
          const basicUser = session.user as AuthUser
          setUser(basicUser)
          
          // Enriquecer perfil de forma asíncrona
          setTimeout(() => {
            enrichUserProfile(session.user)
          }, 100)
        }
        
        setAuthLoading(false)
      }
    })

    // Verificar sesión inicial
    const checkInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        
        if (session?.user) {
          console.log('👤 [AppContext] Sesión inicial encontrada')
          setSession(session)
          const basicUser = session.user as AuthUser
          setUser(basicUser)
          
          // Enriquecer perfil
          setTimeout(() => {
            enrichUserProfile(session.user)
          }, 100)
        }
      } catch (error) {
        console.error('❌ [AppContext] Error verificando sesión:', error)
      } finally {
        setAuthLoading(false)
      }
    }

    checkInitialSession()

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const signOut = async () => {
    console.log('🚪 [AppContext] Cerrando sesión')
    try {
      await baseSignOut()
      clearAuthState()
    } catch (error) {
      console.log('⚠️ Error cerrando sesión:', error)
      clearAuthState()
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
