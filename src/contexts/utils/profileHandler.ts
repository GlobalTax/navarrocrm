
import { User } from '@supabase/supabase-js'
import { supabase } from '@/integrations/supabase/client'
import { AuthUser, UserRole } from '../types'

export const enrichUserProfileAsync = async (
  authUser: User, 
  setUser: (user: AuthUser) => void,
  profileEnrichmentInProgress: React.MutableRefObject<boolean>
) => {
  if (profileEnrichmentInProgress.current) {
    console.log('👤 [ProfileHandler] Enriquecimiento ya en progreso')
    return
  }

  try {
    profileEnrichmentInProgress.current = true
    console.log('👤 [ProfileHandler] Enriqueciendo perfil en segundo plano:', authUser.id)
    
    const { data, error } = await Promise.race([
      supabase
        .from('users')
        .select('role, org_id')
        .eq('id', authUser.id)
        .single(),
      new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('TIMEOUT')), 3000)
      })
    ])

    if (!error && data) {
      const enrichedUser: AuthUser = {
        ...authUser,
        role: data.role as UserRole,
        org_id: data.org_id
      }
      
      console.log('✅ [ProfileHandler] Perfil enriquecido:', { role: data.role, org_id: data.org_id })
      setUser(enrichedUser)
    } else {
      console.log('⚠️ [ProfileHandler] Manteniendo usuario básico:', error?.message || 'Sin datos')
    }
  } catch (error: any) {
    console.log('⚠️ [ProfileHandler] Error enriqueciendo perfil, manteniendo básico:', error.message)
  } finally {
    profileEnrichmentInProgress.current = false
  }
}
