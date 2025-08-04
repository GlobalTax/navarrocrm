
import { User } from '@supabase/supabase-js'
import { supabase } from '@/integrations/supabase/client'
import { AuthUser, UserRole } from '../types'

// Cache de datos de usuario para evitar consultas repetidas
const userDataCache = new Map<string, { data: any; timestamp: number }>()
const CACHE_DURATION = 60 * 60 * 1000 // 1 hora - cache más largo

export const enrichUserProfileAsync = async (
  authUser: User, 
  setUser: (user: AuthUser) => void,
  profileEnrichmentInProgress: React.MutableRefObject<boolean>
) => {
  if (profileEnrichmentInProgress.current) {
    if (import.meta.env.DEV) {
      console.log('👤 [ProfileHandler] Enriquecimiento ya en progreso')
    }
    return
  }

  // Verificar cache primero
  const cached = userDataCache.get(authUser.id)
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    if (import.meta.env.DEV) {
      console.log('👤 [ProfileHandler] Usando datos de cache')
    }
    const enrichedUser: AuthUser = {
      ...authUser,
      role: cached.data.role as UserRole,
      org_id: cached.data.org_id
    }
    setUser(enrichedUser)
    return
  }

  try {
    profileEnrichmentInProgress.current = true
    if (import.meta.env.DEV) {
      console.log('👤 [ProfileHandler] Enriqueciendo perfil:', authUser.id)
    }
    
    const { data, error } = await Promise.race([
      supabase
        .from('users')
        .select('role, org_id')
        .eq('id', authUser.id)
        .maybeSingle(),
      new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('TIMEOUT')), 2000)
      })
    ])

    if (!error && data) {
      // Guardar en cache
      userDataCache.set(authUser.id, { data, timestamp: Date.now() })
      
      const enrichedUser: AuthUser = {
        ...authUser,
        role: data.role as UserRole,
        org_id: data.org_id
      }
      
      if (import.meta.env.DEV) {
        console.log('✅ [ProfileHandler] Perfil enriquecido:', { role: data.role, org_id: data.org_id })
      }
      setUser(enrichedUser)
    } else {
      if (import.meta.env.DEV) {
        console.log('⚠️ [ProfileHandler] Manteniendo usuario básico:', error?.message || 'Sin datos')
      }
      // Usar usuario básico si falla
      setUser(authUser as AuthUser)
    }
  } catch (error: any) {
    if (import.meta.env.DEV) {
      console.log('⚠️ [ProfileHandler] Error enriqueciendo perfil:', error.message)
    }
    // Usar usuario básico si falla
    setUser(authUser as AuthUser)
  } finally {
    profileEnrichmentInProgress.current = false
  }
}
