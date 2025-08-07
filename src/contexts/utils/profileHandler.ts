
import { User } from '@supabase/supabase-js'
import { supabase } from '@/integrations/supabase/client'
import { AuthUser, UserRole } from '../types'
import { profileLogger } from '@/utils/logging'

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
    
    const { data, error } = await Promise.race([
      supabase
        .from('users')
        .select('role, org_id')
        .eq('id', authUser.id)
        .maybeSingle(),
      new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('TIMEOUT')), 2000) // Reducido timeout
      })
    ])

    if (!error && data) {
      const enrichedUser: AuthUser = {
        ...authUser,
        role: data.role as UserRole,
        org_id: data.org_id
      }
      
      profileLogger.info('Perfil enriquecido exitosamente', { role: data.role, org_id: data.org_id })
      setUser(enrichedUser)
    } else {
      profileLogger.warn('Manteniendo usuario básico', { reason: error?.message || 'Sin datos' })
      // Usar usuario básico si falla
      setUser(authUser as AuthUser)
    }
  } catch (error: any) {
    profileLogger.error('Error enriqueciendo perfil', { error: error.message })
    // Usar usuario básico si falla
    setUser(authUser as AuthUser)
  } finally {
    profileEnrichmentInProgress.current = false
  }
}
