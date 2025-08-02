/**
 * Profile Service - Servicio de gestión de perfiles de usuario
 */

import { supabase } from '@/integrations/supabase/client'
import { authLogger } from '@/utils/logging'
import type { ProfileData, UserRole } from '../types'

interface UserProfile {
  id: string
  email: string
  role: UserRole
  org_id: string
  display_name?: string
  avatar_url?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export class ProfileService {
  /**
   * Obtener perfil de usuario por ID
   */
  static async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      authLogger.debug('Obteniendo perfil de usuario', { userId })

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          authLogger.warn('Perfil de usuario no encontrado', { userId })
          return null
        }
        authLogger.error('Error obteniendo perfil', { error: error.message, userId })
        return null
      }

      authLogger.debug('Perfil obtenido exitosamente', { 
        userId,
        role: data.role,
        orgId: data.org_id 
      })

      return data as UserProfile
    } catch (err) {
      authLogger.error('Error inesperado obteniendo perfil', { error: err, userId })
      return null
    }
  }

  /**
   * Actualizar perfil de usuario
   */
  static async updateUserProfile(userId: string, profileData: Partial<ProfileData>): Promise<{ success: boolean; error?: string }> {
    try {
      authLogger.info('Actualizando perfil de usuario', { 
        userId,
        fields: Object.keys(profileData) 
      })

      const { error } = await supabase
        .from('users')
        .update({
          ...profileData,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)

      if (error) {
        authLogger.error('Error actualizando perfil', { 
          error: error.message,
          userId 
        })
        return { success: false, error: error.message }
      }

      authLogger.info('Perfil actualizado exitosamente', { userId })
      return { success: true }
    } catch (err) {
      authLogger.error('Error inesperado actualizando perfil', { error: err, userId })
      return { success: false, error: 'Unexpected error' }
    }
  }

  /**
   * Crear perfil de usuario
   */
  static async createUserProfile(userData: {
    id: string
    email: string
    role: UserRole
    org_id: string
    display_name?: string
    avatar_url?: string
  }): Promise<{ success: boolean; error?: string }> {
    try {
      authLogger.info('Creando perfil de usuario', { 
        userId: userData.id,
        email: userData.email,
        role: userData.role,
        orgId: userData.org_id 
      })

      const { error } = await supabase
        .from('users')
        .insert({
          id: userData.id,
          email: userData.email,
          role: userData.role,
          org_id: userData.org_id,
          display_name: userData.display_name,
          avatar_url: userData.avatar_url,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })

      if (error) {
        authLogger.error('Error creando perfil', { 
          error: error.message,
          userId: userData.id 
        })
        return { success: false, error: error.message }
      }

      authLogger.info('Perfil creado exitosamente', { userId: userData.id })
      return { success: true }
    } catch (err) {
      authLogger.error('Error inesperado creando perfil', { error: err, userId: userData.id })
      return { success: false, error: 'Unexpected error' }
    }
  }

  /**
   * Verificar si el usuario tiene permisos para una acción
   */
  static async getUserPermissions(userId: string): Promise<{
    canManageUsers: boolean
    canManageOrganization: boolean
    canViewAllCases: boolean
    canManageFinances: boolean
    canAccessReports: boolean
    canManageSettings: boolean
  }> {
    try {
      const profile = await this.getUserProfile(userId)
      
      if (!profile) {
        return {
          canManageUsers: false,
          canManageOrganization: false,
          canViewAllCases: false,
          canManageFinances: false,
          canAccessReports: false,
          canManageSettings: false
        }
      }

      // Importar dinámicamente para evitar dependencia circular
      const { ROLE_PERMISSIONS } = await import('../constants')
      
      return ROLE_PERMISSIONS[profile.role] || {
        canManageUsers: false,
        canManageOrganization: false,
        canViewAllCases: false,
        canManageFinances: false,
        canAccessReports: false,
        canManageSettings: false
      }
    } catch (err) {
      authLogger.error('Error obteniendo permisos', { error: err, userId })
      return {
        canManageUsers: false,
        canManageOrganization: false,
        canViewAllCases: false,
        canManageFinances: false,
        canAccessReports: false,
        canManageSettings: false
      }
    }
  }
}