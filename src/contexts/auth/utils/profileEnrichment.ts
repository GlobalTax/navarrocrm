import { supabase } from '@/integrations/supabase/client'
import { AuthUser, UserRole } from '../types'

export const enrichUserProfile = async (
  user: AuthUser,
  logger: any
): Promise<AuthUser> => {
  try {
    logger.debug('Enriching user profile', { userId: user.id })
    
    const { data: profile, error } = await supabase
      .from('users')
      .select('role, org_id')
      .eq('id', user.id)
      .single()
    
    if (error) {
      logger.warn('Could not fetch user profile', { error })
      return user
    }
    
    if (profile) {
      logger.debug('Profile enriched successfully', { 
        role: profile.role, 
        orgId: profile.org_id 
      })
      
      return {
        ...user,
        role: profile.role as UserRole,
        org_id: profile.org_id
      }
    }
    
    return user
  } catch (error) {
    logger.error('Error enriching user profile', { error })
    return user
  }
}