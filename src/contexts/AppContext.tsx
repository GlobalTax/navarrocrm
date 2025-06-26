
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
  const profileEnrichmentRef = useRef(false)

  const { signIn, signUp, signOut: baseSignOut } = useAuthActions()

  // Función para enriquecer perfil de forma controlada
  const enrichUserProfile = async (basicUser: User) => {
    if (profileEnrichmentRef.current) return
    profileEnrichmentRef.current = true

    try {
      const { data: profile } = await supabase
        .from('users')
        .select('role, org_id, full_name')
        .eq('id', basicUser.id)
        .single()

      if (profile) {
        const enrichedUser = {
          ...basicUser,
          role: profile.role as UserRole,
          org_id: profile.org_id,
          full_name: profile.full_name
        } as AuthUser

        console.log('👤 [AppContext] Usuario enriquecido:', enrichedUser.email)
        setUser(enrichedUser)
      }
    } catch (error) {
      console.log('⚠️ [AppContext] No se pudo enriquecer perfil:', error)
    } finally {
      profileEnrichmentRef.current = false
    }
  }

  // Función de limpieza de estado
  const clearAuthState = () => {
    console.log('🧹 [AppContext] Limpiando estado')
    setUser(null)
    setSession(null)
    profileEnrichmentRef.current = false
  }

  // Inicialización única y controlada
  useEffect(() => {
    if (initRef.current) return
    initRef.current = true

    console.log('🚀 [AppContext] Inicializando autenticación...')
    
    // 1. Configurar listener PRIMERO
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔄 [AppContext] Auth event:', event)
      
      setSession(session)
      
      if (session?.user) {
        const basicUser = session.user as AuthUser
        setUser(basicUser)
        
        // Enriquecer perfil después de un pequeño delay
        setTimeout(() => {
          enrichUserProfile(session.user)
        }, 100)
      } else {
        clearAuthState()
      }
      
      // Marcar como no loading después de procesar
      setAuthLoading(false)
    })

    // 2. Verificar sesión inicial
    const checkInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.warn('⚠️ [AppContext] Error obteniendo sesión inicial:', error)
          setAuthLoading(false)
          return
        }

        if (session?.user) {
          console.log('👤 [AppContext] Sesión inicial encontrada')
          setSession(session)
          const basicUser = session.user as AuthUser
          setUser(basicUser)
          
          // Enriquecer perfil
          setTimeout(() => {
            enrichUserProfile(session.user)
          }, 100)
        } else {
          console.log('👤 [AppContext] No hay sesión inicial')
        }
      } catch (error) {
        console.error('❌ [AppContext] Error en sesión inicial:', error)
      } finally {
        setAuthLoading(false)
      }
    }

    // Timeout de seguridad
    const timeoutId = setTimeout(() => {
      console.log('⏰ [AppContext] Timeout de inicialización')
      setAuthLoading(false)
    }, 3000)

    checkInitialSession().then(() => {
      clearTimeout(timeoutId)
    })

    return () => {
      subscription.unsubscribe()
      clearTimeout(timeoutId)
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
