
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
    console.log('👤 [ProfileHandler] Enriqueciendo perfil:', authUser.id)
    
    // Función con retry automático
    const fetchUserProfile = async (retries = 3): Promise<any> => {
      for (let attempt = 1; attempt <= retries; attempt++) {
        try {
          console.log(`👤 [ProfileHandler] Intento ${attempt}/${retries}`)
          
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

          if (error) {
            console.log(`👤 [ProfileHandler] Error en intento ${attempt}:`, error.message)
            if (attempt === retries) throw error
            await new Promise(resolve => setTimeout(resolve, 1000 * attempt)) // Backoff
            continue
          }

          return data
        } catch (error: any) {
          if (error.message === 'TIMEOUT' && attempt < retries) {
            console.log(`👤 [ProfileHandler] Timeout en intento ${attempt}, reintentando...`)
            continue
          }
          throw error
        }
      }
    }

    const userData = await fetchUserProfile()

    if (userData && userData.org_id) {
      const enrichedUser: AuthUser = {
        ...authUser,
        role: userData.role as UserRole,
        org_id: userData.org_id
      }
      
      console.log('✅ [ProfileHandler] Perfil enriquecido exitosamente:', { 
        role: userData.role, 
        org_id: userData.org_id,
        user_id: authUser.id
      })
      setUser(enrichedUser)
    } else {
      console.warn('⚠️ [ProfileHandler] Usuario sin org_id en BD, usando básico')
      setUser(authUser as AuthUser)
    }
  } catch (error: any) {
    console.error('❌ [ProfileHandler] Error crítico enriqueciendo perfil:', error.message)
    // Usar usuario básico si todo falla
    setUser(authUser as AuthUser)
  } finally {
    profileEnrichmentInProgress.current = false
  }
}
