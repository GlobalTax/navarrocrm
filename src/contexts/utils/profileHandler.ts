
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
    
    // Función con retry automático mejorada
    const fetchUserProfile = async (retries = 3): Promise<any> => {
      for (let attempt = 1; attempt <= retries; attempt++) {
        try {
          console.log(`👤 [ProfileHandler] Intento ${attempt}/${retries}`)
          
          const { data, error } = await Promise.race([
            supabase
              .from('users')
              .select('role, org_id')
              .eq('id', authUser.id)
              .single(), // Usar .single() ya que esperamos exactamente un registro
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

    // Validar que los datos críticos estén presentes
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
      
      // Asegurar que el usuario enriquecido se establece correctamente
      setUser(enrichedUser)
    } else if (userData) {
      // Si encontramos al usuario pero sin org_id, usar usuario básico con advertencia
      console.warn('⚠️ [ProfileHandler] Usuario encontrado pero sin org_id:', userData)
      const basicUser: AuthUser = {
        ...authUser,
        role: userData.role as UserRole || 'junior',
        org_id: undefined
      }
      setUser(basicUser)
    } else {
      // Si no encontramos datos del usuario, crear un registro básico
      console.warn('⚠️ [ProfileHandler] No se encontraron datos del usuario en la tabla users')
      const basicUser: AuthUser = {
        ...authUser,
        role: 'junior' as UserRole,
        org_id: undefined
      }
      setUser(basicUser)
    }
  } catch (error: any) {
    console.error('❌ [ProfileHandler] Error crítico enriqueciendo perfil:', error.message)
    
    // Fallback: usar usuario básico sin crash
    const fallbackUser: AuthUser = {
      ...authUser,
      role: 'junior' as UserRole,
      org_id: undefined
    }
    setUser(fallbackUser)
  } finally {
    profileEnrichmentInProgress.current = false
  }
}
