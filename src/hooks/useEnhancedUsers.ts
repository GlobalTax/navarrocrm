
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useApp } from '@/contexts/AppContext'
import { toast } from 'sonner'
import { UserFilters } from '@/components/users/UserAdvancedFilters'

export interface EnhancedUser {
  id: string
  email: string
  role: string
  org_id: string | null
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

      if (filters.role && filters.role !== 'all') {
        query = query.eq('role', filters.role)
      }

      if (filters.status === 'active') {
        query = query.eq('is_active', true)
      } else if (filters.status === 'inactive') {
        query = query.eq('is_active', false)
      }

      if (filters.createdAfter) {
        query = query.gte('created_at', filters.createdAfter)
      }

      if (filters.createdBefore) {
        query = query.lte('created_at', filters.createdBefore)
      }

      if (filters.lastLoginDays) {
        const date = new Date()
        date.setDate(date.getDate() - filters.lastLoginDays)
        query = query.gte('last_login_at', date.toISOString())
      }

      const { data, error } = await query.order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    },
    enabled: !!user?.org_id,
  })

  const activateUser = useMutation({
    mutationFn: async (userId: string) => {
      if (!user?.org_id) throw new Error('No hay organización disponible')

      const { error } = await supabase
        .from('users')
        .update({
          is_active: true,
          deleted_at: null,
          deleted_by: null
        })
        .eq('id', userId)

      if (error) throw error

      // Registrar en auditoría
      await supabase
        .from('user_audit_log')
        .insert({
          org_id: user.org_id,
          target_user_id: userId,
          action_by: user.id,
          action_type: 'user_activated',
          old_value: { is_active: false },
          new_value: { is_active: true },
          details: 'Usuario reactivado'
        })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enhanced-users'] })
      toast.success('Usuario reactivado correctamente')
    },
    onError: (error: any) => {
      toast.error('Error reactivando el usuario')
    },
  })

  const getFilteredStats = () => {
    return {
      total: users.length,
      active: users.filter(u => u.is_active).length,
      inactive: users.filter(u => !u.is_active).length,
      partners: users.filter(u => u.role === 'partner').length,
      managers: users.filter(u => u.role === 'area_manager').length,
      seniors: users.filter(u => u.role === 'senior').length,
      juniors: users.filter(u => u.role === 'junior').length,
      finance: users.filter(u => u.role === 'finance').length
    }
  }

  return {
    users,
    isLoading,
    error,
    activateUser,
    getFilteredStats
  }
}
