
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useApp } from '@/contexts/AppContext'
import { createLogger } from '@/utils/logger'
import type { UserPermission } from './types'

/**
 * Opciones para la consulta de permisos de usuario
 * @interface UseUserPermissionsQueryOptions
 */
export interface UseUserPermissionsQueryOptions {
  /** Habilitar la consulta */
  enabled?: boolean
  /** Tiempo de cache en milisegundos */
  staleTime?: number
  /** ID de usuario específico para filtrar permisos */
  userId?: string
}

/**
 * Hook para consultar permisos de usuarios de la organización
 * Obtiene y cachea los permisos con validación y manejo de errores robusto
 * 
 * @param {UseUserPermissionsQueryOptions} options - Opciones de configuración
 * @returns {Object} Resultado de la consulta de permisos
 * 
 * @example
 * ```tsx
 * const { data: permissions, isLoading, error } = useUserPermissionsQuery({
 *   staleTime: 300000, // 5 minutos
 *   userId: 'specific-user-id' // opcional
 * })
 * 
 * if (isLoading) return <div>Cargando permisos...</div>
 * if (error) return <div>Error: {error.message}</div>
 * 
 * return (
 *   <div>
 *     {permissions.map(permission => (
 *       <div key={permission.id}>{permission.module}: {permission.permission}</div>
 *     ))}
 *   </div>
 * )
 * ```
 * 
 * @throws {Error} Cuando no se puede acceder a los datos del usuario
 * @throws {Error} Cuando org_id es inválido
 */
export const useUserPermissionsQuery = (options: UseUserPermissionsQueryOptions = {}) => {
  const logger = createLogger('useUserPermissionsQuery')
  const { user } = useApp()

  // Validación de parámetros
  if (options.staleTime && (options.staleTime < 0 || options.staleTime > 1000 * 60 * 60)) {
    logger.warn('staleTime fuera de rango recomendado (0-3600000ms)', { staleTime: options.staleTime })
  }

  if (options.userId && typeof options.userId !== 'string') {
    logger.error('userId debe ser una cadena válida', { userId: options.userId })
    throw new Error('El parámetro userId debe ser una cadena válida')
  }

  // Validación de contexto
  if (!user) {
    logger.error('Usuario no encontrado en el contexto')
    throw new Error('Usuario no autenticado')
  }

  if (!user.org_id) {
    logger.warn('org_id no encontrado para el usuario', { userId: user.id })
  }

  return useQuery({
    queryKey: ['user-permissions', user?.org_id, options.userId],
    queryFn: async (): Promise<UserPermission[]> => {
      try {
        if (!user?.org_id) {
          logger.info('Sin org_id, devolviendo array vacío')
          return []
        }
        
        logger.info('Obteniendo permisos de usuario', { 
          orgId: user.org_id,
          filterUserId: options.userId 
        })
        
        let query = supabase
          .from('user_permissions')
          .select('*')
          .eq('org_id', user.org_id)

        // Filtrar por usuario específico si se proporciona
        if (options.userId) {
          query = query.eq('user_id', options.userId)
        }

        const { data, error } = await query.order('created_at', { ascending: false })

        if (error) {
          logger.error('Error al obtener permisos de usuario', error)
          throw error
        }

        const permissions = data || []
        logger.info('Permisos obtenidos exitosamente', { 
          count: permissions.length,
          filterUserId: options.userId 
        })
        
        return permissions
      } catch (err) {
        logger.error('Error en queryFn de permisos', err)
        throw err
      }
    },
    enabled: !!user?.org_id && (options.enabled ?? true),
    staleTime: options.staleTime ?? 1000 * 60 * 5, // 5 minutos por defecto
    retry: (failureCount, error) => {
      if (failureCount >= 3) {
        logger.error('Máximo número de reintentos alcanzado', { failureCount, error })
        return false
      }
      return true
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  })
}

/**
 * Obtiene los permisos de un usuario específico
 * Función utilitaria para filtrar permisos por ID de usuario
 * 
 * @param {UserPermission[]} permissions - Array de permisos
 * @param {string} userId - ID del usuario
 * @returns {UserPermission[]} Permisos del usuario especificado
 * 
 * @example
 * ```tsx
 * const userPermissions = getUserPermissions(allPermissions, 'user-123')
 * console.log(`Usuario tiene ${userPermissions.length} permisos`)
 * ```
 * 
 * @throws {Error} Cuando userId no es una cadena válida
 * @throws {Error} Cuando permissions no es un array válido
 */
export const getUserPermissions = (permissions: UserPermission[], userId: string): UserPermission[] => {
  const logger = createLogger('getUserPermissions')

  // Validación de parámetros
  if (!Array.isArray(permissions)) {
    logger.error('permissions debe ser un array', { permissions: typeof permissions })
    throw new Error('El parámetro permissions debe ser un array válido')
  }

  if (!userId || typeof userId !== 'string') {
    logger.error('userId debe ser una cadena no vacía', { userId })
    throw new Error('El parámetro userId debe ser una cadena válida no vacía')
  }

  try {
    const userPermissions = permissions.filter(permission => {
      if (!permission || typeof permission !== 'object') {
        logger.warn('Permiso inválido encontrado', { permission })
        return false
      }
      return permission.user_id === userId
    })

    logger.debug('Permisos filtrados para usuario', { 
      userId, 
      totalPermissions: permissions.length,
      userPermissions: userPermissions.length 
    })

    return userPermissions
  } catch (error) {
    logger.error('Error al filtrar permisos de usuario', error)
    return []
  }
}

/**
 * Verifica si un usuario tiene un permiso específico
 * Función utilitaria para validación de permisos granular
 * 
 * @param {UserPermission[]} permissions - Array de permisos
 * @param {string} userId - ID del usuario
 * @param {string} module - Módulo del sistema
 * @param {string} permission - Permiso específico
 * @returns {boolean} true si el usuario tiene el permiso
 * 
 * @example
 * ```tsx
 * const canEditCases = hasPermission(permissions, 'user-123', 'cases', 'edit')
 * if (canEditCases) {
 *   return <EditButton />
 * }
 * ```
 * 
 * @throws {Error} Cuando los parámetros no son válidos
 */
export const hasPermission = (
  permissions: UserPermission[], 
  userId: string, 
  module: string, 
  permission: string
): boolean => {
  const logger = createLogger('hasPermission')

  // Validación de parámetros
  if (!Array.isArray(permissions)) {
    logger.error('permissions debe ser un array', { permissions: typeof permissions })
    throw new Error('El parámetro permissions debe ser un array válido')
  }

  if (!userId || typeof userId !== 'string') {
    logger.error('userId debe ser una cadena no vacía', { userId })
    throw new Error('El parámetro userId debe ser una cadena válida no vacía')
  }

  if (!module || typeof module !== 'string') {
    logger.error('module debe ser una cadena no vacía', { module })
    throw new Error('El parámetro module debe ser una cadena válida no vacía')
  }

  if (!permission || typeof permission !== 'string') {
    logger.error('permission debe ser una cadena no vacía', { permission })
    throw new Error('El parámetro permission debe ser una cadena válida no vacía')
  }

  try {
    const hasAccess = permissions.some(p => {
      if (!p || typeof p !== 'object') {
        logger.warn('Permiso inválido encontrado', { permission: p })
        return false
      }
      
      return p.user_id === userId && 
             p.module === module && 
             p.permission === permission
    })

    logger.debug('Verificación de permiso', {
      userId,
      module,
      permission,
      hasAccess,
      totalPermissions: permissions.length
    })

    return hasAccess
  } catch (error) {
    logger.error('Error al verificar permiso', error)
    return false
  }
}
