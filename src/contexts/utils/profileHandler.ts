
import { User } from '@supabase/supabase-js'
import { supabase } from '@/integrations/supabase/client'
import { AuthUser, UserRole } from '../types'
import { profileLogger } from '@/utils/logging'

const enrichUserProfileWithRetry = async (
  authUser: User,
  attempt: number = 1,
  maxAttempts: number = 3
): Promise<{ data: any; error: any }> => {
  try {
    const { data, error } = await Promise.race([
      supabase
        .from('users')
        .select('role, org_id')
        .eq('id', authUser.id)
        .maybeSingle(),
      new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('TIMEOUT')), 5000) // Aumentado timeout a 5 segundos
      })
    ])

    return { data, error }
  } catch (error: any) {
    if (error.message === 'TIMEOUT' && attempt < maxAttempts) {
      profileLogger.warn(`Timeout en intento ${attempt}, reintentando...`, { userId: authUser.id })
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt)) // Backoff exponencial
      return enrichUserProfileWithRetry(authUser, attempt + 1, maxAttempts)
    }
    throw error
  }
}

export const enrichUserProfileAsync = async (
  authUser: User, 
  setUser: (user: AuthUser) => void,
  profileEnrichmentInProgress: React.MutableRefObject<boolean>
) => {
  if (profileEnrichmentInProgress.current) {
    profileLogger.debug('Enriquecimiento ya en progreso')
    return
  }

  try {
    profileEnrichmentInProgress.current = true
    profileLogger.info('Enriqueciendo perfil', { userId: authUser.id })
    
    const { data, error } = await enrichUserProfileWithRetry(authUser)

    if (!error && data) {
      const enrichedUser: AuthUser = {
        ...authUser,
        role: data.role as UserRole,
        org_id: data.org_id
      }
      
      profileLogger.info('Perfil enriquecido exitosamente', { role: data.role, org_id: data.org_id })
      setUser(enrichedUser)
    } else {
      profileLogger.warn('Fallback a usuario básico', { 
        reason: error?.message || 'Sin datos',
        hasData: !!data,
        errorCode: error?.code 
      })
      
      // Fallback robusto: crear usuario básico con valores por defecto
      const basicUser: AuthUser = {
        ...authUser,
        role: 'junior' as UserRole, // Rol por defecto más conservador
        org_id: null
      }
      
      setUser(basicUser)
    }
  } catch (error: any) {
    profileLogger.error('Error crítico enriqueciendo perfil', { 
      error: error.message,
      stack: error.stack,
      userId: authUser.id 
    })
    
    // Fallback de emergencia
    const emergencyUser: AuthUser = {
      ...authUser,
      role: 'junior' as UserRole,
      org_id: null
    }
    
    setUser(emergencyUser)
  } finally {
    profileEnrichmentInProgress.current = false
  }
}
