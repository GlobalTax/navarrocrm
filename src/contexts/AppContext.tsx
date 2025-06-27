
import React, { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/integrations/supabase/client'
import { AppState, AuthUser, UserRole } from './types'
import { useAuthActions } from './hooks/useAuthActions'
import { useSystemSetup } from '@/hooks/useSystemSetup'

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
  
  const { isSetup, loading: setupLoading } = useSystemSetup()
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
      
      // Intentar enriquecer perfil en segundo plano con reintentos
      setTimeout(async () => {
        await enrichUserProfile(session.user)
      }, 100)
    }

    // Función para enriquecer perfil con reintentos
    const enrichUserProfile = async (authUser: User, retries = 3) => {
      for (let attempt = 1; attempt <= retries; attempt++) {
        try {
          console.log(`🔍 [AppContext] Enriqueciendo perfil (intento ${attempt}/${retries}) para usuario:`, authUser.id)
          
          const { data: profile, error } = await supabase
            .from('users')
            .select('role, org_id')
            .eq('id', authUser.id)
            .maybeSingle()

          if (error) {
            console.error(`❌ [AppContext] Error en intento ${attempt}:`, {
              error: error,
              message: error.message,
              details: error.details,
              hint: error.hint,
              code: error.code
            })
            
            // Si es el último intento, manejar el error
            if (attempt === retries) {
              if (error.code === 'PGRST116') {
                console.warn('⚠️ [AppContext] Usuario no encontrado en tabla users, usando perfil básico')
              }
              return
            }
            
            // Esperar antes del siguiente intento
            await new Promise(resolve => setTimeout(resolve, 1000 * attempt))
            continue
          }

          if (profile && profile.org_id) {
            const enrichedUser: AuthUser = {
              ...authUser,
              role: profile.role as UserRole,
              org_id: profile.org_id
            }
            setUser(enrichedUser)
            console.log('✅ [AppContext] Perfil enriquecido exitosamente:', {
              role: profile.role,
              org_id: profile.org_id,
              user_id: authUser.id
            })
            return // Éxito, salir del bucle
          } else if (profile) {
            // Usuario encontrado pero sin org_id
            console.warn('⚠️ [AppContext] Usuario encontrado pero sin org_id:', profile)
            const basicUserWithRole: AuthUser = {
              ...authUser,
              role: (profile.role as UserRole) || 'junior',
              org_id: undefined
            }
            setUser(basicUserWithRole)
            return
          } else {
            // No se encontraron datos
            console.warn('⚠️ [AppContext] No se encontraron datos del usuario')
            if (attempt < retries) {
              await new Promise(resolve => setTimeout(resolve, 1000 * attempt))
              continue
            }
          }
        } catch (error: any) {
          console.error(`❌ [AppContext] Error crítico en intento ${attempt}:`, error.message)
          
          if (attempt < retries) {
            await new Promise(resolve => setTimeout(resolve, 1000 * attempt))
            continue
          }
          
          // Fallback final: usar usuario básico
          const fallbackUser: AuthUser = {
            ...authUser,
            role: 'junior' as UserRole,
            org_id: undefined
          }
          setUser(fallbackUser)
        }
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
    isSetup: isSetup ?? true, // Default to true to prevent setup loop
    setupLoading,
    isInitializing: authLoading || setupLoading,
    signIn,
    signUp,
    signOut,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}
