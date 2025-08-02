
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useApp } from '@/contexts/AppContext'
import { toast } from 'sonner'
import { usersDAL } from '@/lib/dal'
import { logger } from '@/utils/logging'

export interface UserFilters {
  search: string
  role: string
  status: string
}

export interface EnhancedUser {
  id: string
  email: string
  role: string
  org_id: string
  created_at?: string
  updated_at?: string
  is_active: boolean
  last_login_at?: string
  deleted_at?: string
  deleted_by?: string
}

export const useEnhancedUsers = (filters: UserFilters) => {
  const { user } = useApp()
  const queryClient = useQueryClient()

  const { data: users = [], isLoading, error } = useQuery({
    queryKey: ['enhanced-users', user?.org_id, filters],
    queryFn: async (): Promise<EnhancedUser[]> => {
      if (!user?.org_id) return []
      
      const queryOptions: any = {
        sort: [{ column: 'email', ascending: true }]
      }

      // Build filters object
      const dalFilters: any = { org_id: user.org_id }

      if (filters.role !== 'all') {
        dalFilters.role = filters.role
      }

      if (filters.status === 'active') {
        dalFilters.is_active = true
      } else if (filters.status === 'inactive') {
        dalFilters.is_active = false
      }

      queryOptions.filters = dalFilters

      const result = await usersDAL.findMany(queryOptions)
      
      if (!result.success) {
        logger.error('Error fetching users', { error: result.error, filters })
        throw result.error
      }

      // Apply search filter client-side for now
      let filteredUsers = result.data
      if (filters.search) {
        filteredUsers = result.data.filter(user => 
          user.email?.toLowerCase().includes(filters.search.toLowerCase())
        )
      }

      return filteredUsers
    },
    enabled: !!user?.org_id,
  })

  const activateUser = useMutation({
    mutationFn: async (userId: string) => {
      const updateData: any = { 
        is_active: true, 
        deleted_at: null, 
        deleted_by: null,
        updated_at: new Date().toISOString()
      }
      const result = await usersDAL.update(userId, updateData)

      if (!result.success) throw result.error
      return result.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enhanced-users'] })
      toast.success('Usuario reactivado correctamente')
    },
    onError: (error: any) => {
      logger.error('Error reactivando usuario', { error, userId: user?.id })
      toast.error('Error al reactivar el usuario')
    },
  })

  const deactivateUser = useMutation({
    mutationFn: async (userId: string) => {
      const updateData: any = { 
        is_active: false,
        deleted_at: new Date().toISOString(),
        deleted_by: user?.id,
        updated_at: new Date().toISOString()
      }
      const result = await usersDAL.update(userId, updateData)

      if (!result.success) throw result.error
      return result.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enhanced-users'] })
      toast.success('Usuario desactivado correctamente')
    },
    onError: (error: any) => {
      logger.error('Error desactivando usuario', { error, userId: user?.id })
      toast.error('Error al desactivar el usuario')
    },
  })

  const getFilteredStats = () => {
    const stats = {
      total: users.length,
      active: users.filter(u => u.is_active).length,
      partners: users.filter(u => u.role === 'partner').length,
      managers: users.filter(u => u.role === 'area_manager').length,
      seniors: users.filter(u => u.role === 'senior').length,
      juniors: users.filter(u => u.role === 'junior').length,
    }

    return stats
  }

  return {
    users,
    isLoading,
    error,
    activateUser,
    deactivateUser,
    getFilteredStats
  }
}
