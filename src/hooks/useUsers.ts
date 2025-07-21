
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useApp } from '@/contexts/AppContext'
import { useMemo } from 'react'
import { createLogger } from '@/utils/logger'

/**
 * Interface para un usuario del sistema
 * @interface User
 */
export interface User {
  /** ID único del usuario */
  id: string
  /** Email del usuario */
  email: string
  /** Rol del usuario en el sistema */
  role: string
  /** ID de la organización del usuario */
  org_id: string | null
  /** Fecha de creación */
  created_at: string
  /** Fecha de última actualización */
  updated_at: string
}

/**
 * Configuración de opciones para useUsers
 * @interface UseUsersOptions
 */
export interface UseUsersOptions {
  /** Habilitar la consulta */
  enabled?: boolean
  /** Tiempo de cache en milisegundos */
  staleTime?: number
  /** Ordenamiento de resultados */
  sortBy?: 'email' | 'created_at' | 'role'
  /** Dirección del ordenamiento */
  sortOrder?: 'asc' | 'desc'
}

/**
 * Resultado del hook useUsers
 * @interface UseUsersResult
 */
export interface UseUsersResult {
  /** Lista de usuarios */
  users: User[]
  /** Estado de carga */
  isLoading: boolean
  /** Error si existe */
  error: Error | null
  /** Función para revalidar datos */
  refetch: () => void
}

/**
 * Hook para obtener y gestionar usuarios de la organización
 * Proporciona funcionalidades para obtener usuarios con cache, validación y manejo de errores
 * 
 * @param {UseUsersOptions} options - Opciones de configuración
 * @returns {UseUsersResult} Resultado con usuarios, estado de carga y funciones
 * 
 * @example
 * ```tsx
 * const { users, isLoading, error } = useUsers({
 *   sortBy: 'email',
 *   staleTime: 300000 // 5 minutos
 * })
 * 
 * if (isLoading) return <div>Cargando usuarios...</div>
 * if (error) return <div>Error: {error.message}</div>
 * 
 * return (
 *   <div>
 *     {users.map(user => (
 *       <div key={user.id}>{user.email}</div>
 *     ))}
 *   </div>
 * )
 * ```
 * 
 * @throws {Error} Cuando no se puede acceder a los datos del usuario
 * @throws {Error} Cuando org_id es inválido o está vacío
 */
export const useUsers = (options: UseUsersOptions = {}): UseUsersResult => {
  const logger = createLogger('useUsers')
  const { user } = useApp()

  // Validación de parámetros
  const validatedOptions = useMemo(() => {
    const defaults: Required<UseUsersOptions> = {
      enabled: true,
      staleTime: 1000 * 60 * 5, // 5 minutos
      sortBy: 'email',
      sortOrder: 'asc'
    }

    // Validar staleTime
    if (options.staleTime && (options.staleTime < 0 || options.staleTime > 1000 * 60 * 60)) {
      logger.warn('staleTime fuera de rango recomendado (0-3600000ms)', { staleTime: options.staleTime })
    }

    // Validar sortBy
    if (options.sortBy && !['email', 'created_at', 'role'].includes(options.sortBy)) {
      logger.warn('sortBy inválido, usando valor por defecto', { sortBy: options.sortBy })
    }

    return { ...defaults, ...options }
  }, [options, logger])

  // Validación de contexto
  if (!user) {
    logger.error('Usuario no encontrado en el contexto')
    throw new Error('Usuario no autenticado')
  }

  if (!user.org_id) {
    logger.warn('org_id no encontrado para el usuario', { userId: user.id })
  }

  const { data: users = [], isLoading, error, refetch } = useQuery({
    queryKey: ['users', user?.org_id, validatedOptions.sortBy, validatedOptions.sortOrder],
    queryFn: async (): Promise<User[]> => {
      try {
        if (!user?.org_id) {
          logger.info('Sin org_id, devolviendo array vacío')
          return []
        }
        
        logger.info('Obteniendo usuarios', { 
          orgId: user.org_id, 
          sortBy: validatedOptions.sortBy,
          sortOrder: validatedOptions.sortOrder 
        })
        
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('org_id', user.org_id)
          .order(validatedOptions.sortBy, { ascending: validatedOptions.sortOrder === 'asc' })

        if (error) {
          logger.error('Error al obtener usuarios', error)
          throw error
        }

        const users = data || []
        logger.info('Usuarios obtenidos exitosamente', { count: users.length })
        
        return users
      } catch (err) {
        logger.error('Error en queryFn de usuarios', err)
        throw err
      }
    },
    enabled: !!user?.org_id && validatedOptions.enabled,
    staleTime: validatedOptions.staleTime,
    select: (data) => {
      try {
        return data.map(user => ({
          id: user.id,
          email: user.email,
          role: user.role,
          org_id: user.org_id,
          created_at: user.created_at,
          updated_at: user.updated_at
        }))
      } catch (err) {
        logger.error('Error al procesar datos de usuarios', err)
        return []
      }
    },
    placeholderData: (previousData) => previousData ?? [],
    retry: (failureCount, error) => {
      if (failureCount >= 3) {
        logger.error('Máximo número de reintentos alcanzado', { failureCount, error })
        return false
      }
      return true
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  })

  return {
    users,
    isLoading,
    error,
    refetch,
  }
}
