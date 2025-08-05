import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useApp } from '@/contexts/AppContext'
import { toast } from 'sonner'
import type { SubscriptionUserAssignment, CreateSubscriptionAssignmentData } from '@/types/subscription-assignments'

export const useSubscriptionAssignments = (subscriptionId?: string) => {
  const { user } = useApp()
  const queryClient = useQueryClient()

  const { data: assignments = [], isLoading } = useQuery({
    queryKey: ['subscription-assignments', subscriptionId],
    queryFn: async () => {
      if (!user?.org_id) return []

      try {
        // Obtener asignaciones básicas
        let assignmentsQuery = supabase
          .from('subscription_user_assignments')
          .select('*')
          .eq('org_id', user.org_id)
          .order('assigned_date', { ascending: false })

        if (subscriptionId) {
          assignmentsQuery = assignmentsQuery.eq('subscription_id', subscriptionId)
        }

        const { data: assignmentsData, error: assignmentsError } = await assignmentsQuery

        if (assignmentsError) {
          console.error('Error fetching subscription assignments:', assignmentsError)
          return []
        }

        if (!assignmentsData || assignmentsData.length === 0) {
          return []
        }

        // Obtener información de usuarios por separado
        const userIds = [...new Set(assignmentsData.map(a => a.user_id))]
        const { data: usersData, error: usersError } = await supabase
          .from('users')
          .select('id, email, role')
          .in('id', userIds)

        if (usersError) {
          console.error('Error fetching users data:', usersError)
          // Retornar asignaciones sin datos de usuario si falla
          return assignmentsData
        }

        // Combinar datos manualmente
        const enrichedAssignments = assignmentsData.map(assignment => ({
          ...assignment,
          user: usersData?.find(user => user.id === assignment.user_id) || null
        }))

        return enrichedAssignments
      } catch (error) {
        console.error('Unexpected error fetching subscription assignments:', error)
        return []
      }
    },
    enabled: !!user?.org_id,
  })

  const createAssignment = useMutation({
    mutationFn: async (data: CreateSubscriptionAssignmentData) => {
      if (!user?.org_id) throw new Error('No organization found')

      const { error } = await supabase
        .from('subscription_user_assignments')
        .insert({
          ...data,
          org_id: user.org_id,
        })

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription-assignments'] })
      queryClient.invalidateQueries({ queryKey: ['outgoing-subscriptions'] })
      toast.success('Licencia asignada correctamente')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al asignar licencia')
    },
  })

  const updateAssignment = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<SubscriptionUserAssignment> }) => {
      const { error } = await supabase
        .from('subscription_user_assignments')
        .update(data)
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription-assignments'] })
      queryClient.invalidateQueries({ queryKey: ['outgoing-subscriptions'] })
      toast.success('Asignación actualizada correctamente')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al actualizar asignación')
    },
  })

  const deleteAssignment = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('subscription_user_assignments')
        .delete()
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription-assignments'] })
      queryClient.invalidateQueries({ queryKey: ['outgoing-subscriptions'] })
      toast.success('Asignación eliminada correctamente')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al eliminar asignación')
    },
  })

  return {
    assignments,
    isLoading,
    createAssignment,
    updateAssignment,
    deleteAssignment,
    isCreating: createAssignment.isPending,
    isUpdating: updateAssignment.isPending,
    isDeleting: deleteAssignment.isPending,
  }
}

export const useSubscriptionAssignmentStats = () => {
  const { user } = useApp()

  return useQuery({
    queryKey: ['subscription-assignment-stats', user?.org_id],
    queryFn: async () => {
      if (!user?.org_id) return null

      // Get subscriptions with their assignment counts
      const { data: subscriptions, error: subError } = await supabase
        .from('outgoing_subscriptions')
        .select('id, provider_name, quantity, amount, currency')
        .eq('org_id', user.org_id)
        .eq('status', 'ACTIVE')

      if (subError) throw subError

      // Get assignment counts separately
      const { data: assignments, error: assignError } = await supabase
        .from('subscription_user_assignments')
        .select('subscription_id, status, user_id')
        .eq('org_id', user.org_id)

      if (assignError) throw assignError

      // Calculate stats
      const totalSubscriptions = subscriptions?.length || 0
      const totalLicenses = subscriptions?.reduce((sum, sub) => sum + sub.quantity, 0) || 0
      
      // Count active assignments
      const assignmentsBySubscription = assignments?.reduce((acc, assignment) => {
        if (assignment.status === 'active') {
          acc[assignment.subscription_id] = (acc[assignment.subscription_id] || 0) + 1
        }
        return acc
      }, {} as Record<string, number>) || {}

      const assignedLicenses = Object.values(assignmentsBySubscription).reduce((sum, count) => sum + count, 0)

      const availableLicenses = totalLicenses - assignedLicenses
      const utilizationRate = totalLicenses > 0 ? (assignedLicenses / totalLicenses) * 100 : 0

      // Count unique users with active assignments
      const uniqueUsers = new Set(
        assignments?.filter(a => a.status === 'active').map(a => a.user_id) || []
      ).size

      return {
        totalSubscriptions,
        totalLicenses,
        assignedLicenses,
        availableLicenses,
        utilizationRate,
        usersWithLicenses: uniqueUsers,
      }
    },
    enabled: !!user?.org_id,
  })
}