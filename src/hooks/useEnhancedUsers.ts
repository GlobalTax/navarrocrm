
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useApp } from '@/contexts/AppContext'
import { toast } from 'sonner'
import { useMemo } from 'react'

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
  created_at: string
  updated_at: string
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
    queryFn: async () => {
      if (!user?.org_id) return []
      
      let query = supabase
        .from('users')
        .select('*')
        .eq('org_id', user.org_id)

      // Aplicar filtros
      if (filters.search) {
        query = query.ilike('email', `%${filters.search}%`)
      }

      if (filters.role !== 'all') {
        query = query.eq('role', filters.role)
      }

      if (filters.status === 'active') {
        query = query.eq('is_active', true)
      } else if (filters.status === 'inactive') {
        query = query.eq('is_active', false)
      }

      const { data, error } = await query.order('email', { ascending: true })

      if (error) throw error
      return data || []
    },
    enabled: !!user?.org_id,
    staleTime: 1000 * 60 * 3, // 3 minutos para usuarios con filtros
    select: (data) => data.map(user => ({
      id: user.id,
      email: user.email,
      role: user.role,
      org_id: user.org_id,
      created_at: user.created_at,
      updated_at: user.updated_at,
      is_active: user.is_active,
      last_login_at: user.last_login_at,
      deleted_at: user.deleted_at,
      deleted_by: user.deleted_by
    })),
    placeholderData: (previousData) => previousData ?? [],
  })

  const activateUser = useMutation({
    mutationFn: async (userId: string) => {
      const { data, error } = await supabase
        .from('users')
        .update({ 
          is_active: true, 
          deleted_at: null, 
          deleted_by: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enhanced-users'] })
      toast.success('Usuario reactivado correctamente')
    },
    onError: (error: any) => {
      console.error('Error reactivando usuario:', error)
      toast.error('Error al reactivar el usuario')
    },
  })

  const deactivateUser = useMutation({
    mutationFn: async (userId: string) => {
      const { data, error } = await supabase
        .from('users')
        .update({ 
          is_active: false,
          deleted_at: new Date().toISOString(),
          deleted_by: user?.id,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enhanced-users'] })
      toast.success('Usuario desactivado correctamente')
    },
    onError: (error: any) => {
      console.error('Error desactivando usuario:', error)
      toast.error('Error al desactivar el usuario')
    },
  })

  const getFilteredStats = useMemo(() => {
    const stats = {
      total: users.length,
      active: users.filter(u => u.is_active).length,
      partners: users.filter(u => u.role === 'partner').length,
      managers: users.filter(u => u.role === 'area_manager').length,
      seniors: users.filter(u => u.role === 'senior').length,
      juniors: users.filter(u => u.role === 'junior').length,
    }

    return stats
  }, [users])

  return {
    users,
    isLoading,
    error,
    activateUser,
    deactivateUser,
    getFilteredStats
  }
}
