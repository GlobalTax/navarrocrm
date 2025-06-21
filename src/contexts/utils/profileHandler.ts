
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/integrations/supabase/client'
import { AuthUser, UserRole } from '../types'
import { profileCache } from './authCache'

export const handleUserProfile = async (
  authUser: User, 
  userSession: Session,
  profileFetchInProgress: Set<string>
): Promise<AuthUser> => {
  // Evitar consultas duplicadas
  if (profileFetchInProgress.has(authUser.id)) {
    console.log('👤 [ProfileHandler] Consulta de perfil ya en progreso para:', authUser.id)
    // Esperar un poco y devolver desde caché si existe
    const cached = profileCache.get(authUser.id)
    if (cached) {
      return cached.user
    }
    return authUser as AuthUser
  }

  try {
    profileFetchInProgress.add(authUser.id)
    
    // Verificar caché de perfil
    const cached = profileCache.get(authUser.id)
    if (cached && (Date.now() - cached.timestamp) < 30000) { // 30 segundos
      console.log('👤 [ProfileHandler] Usando perfil en caché para:', authUser.id)
      return cached.user
    }

    console.log('👤 [ProfileHandler] Consultando perfil:', authUser.id)
    
    // Timeout mejorado usando Promise.race
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('TIMEOUT')), 8000) // Aumentado a 8 segundos
    })

    const queryPromise = supabase
      .from('users')
      .select('role, org_id')
      .eq('id', authUser.id)
      .single()

    try {
      const result = await Promise.race([queryPromise, timeoutPromise])
      const { data, error } = result

      if (error) {
        console.warn('⚠️ [ProfileHandler] Error consultando perfil:', error.message)
        throw error
      }

      const enrichedUser: AuthUser = {
        ...authUser,
        role: data.role as UserRole,
        org_id: data.org_id
      }

      // Actualizar caché
      profileCache.set(authUser.id, {
        user: enrichedUser,
        timestamp: Date.now()
      })

      console.log('✅ [ProfileHandler] Perfil cargado:', { role: data.role, org_id: data.org_id })
      return enrichedUser
    } catch (fetchError: any) {
      if (fetchError.message === 'TIMEOUT') {
        console.warn('⏰ [ProfileHandler] Timeout en consulta de perfil')
      }
      
      // Usar usuario básico como fallback
      console.log('⚠️ [ProfileHandler] Usando usuario básico como fallback')
      const fallbackUser = authUser as AuthUser
      
      profileCache.set(authUser.id, {
        user: fallbackUser,
        timestamp: Date.now()
      })
      
      return fallbackUser
    }
  } catch (error: any) {
    console.error('❌ [ProfileHandler] Error manejando perfil:', error)
    return authUser as AuthUser
  } finally {
    profileFetchInProgress.delete(authUser.id)
  }
}
