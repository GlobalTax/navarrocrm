import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useApp } from '@/contexts/AppContext'
import { toast } from 'sonner'
import type { SubscriptionPlan } from '@/types/subscriptions'

export const useSubscriptionPlans = () => {
  const { user } = useApp()
  const queryClient = useQueryClient()

  // Obtener todos los planes
  const { data: plans = [], isLoading } = useQuery({
    queryKey: ['subscription-plans', user?.org_id],
    queryFn: async () => {
      if (!user?.org_id) return []

      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('org_id', user.org_id)
        .order('price', { ascending: true })

      if (error) throw error
      return data as SubscriptionPlan[]
    },
    enabled: !!user?.org_id
  })

  // Crear plan
  const createPlan = useMutation({
    mutationFn: async (planData: Omit<SubscriptionPlan, 'id' | 'org_id' | 'created_at' | 'updated_at'>) => {
      if (!user?.org_id) throw new Error('Usuario no autenticado')

      const { data, error } = await supabase
        .from('subscription_plans')
        .insert({
          ...planData,
          org_id: user.org_id
        })
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription-plans'] })
      toast.success('Plan creado exitosamente')
    },
    onError: (error) => {
      console.error('Error creating plan:', error)
      toast.error('Error al crear el plan')
    }
  })

  // Actualizar plan
  const updatePlan = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<SubscriptionPlan> }) => {
      const { error } = await supabase
        .from('subscription_plans')
        .update(data)
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription-plans'] })
      toast.success('Plan actualizado exitosamente')
    },
    onError: (error) => {
      console.error('Error updating plan:', error)
      toast.error('Error al actualizar el plan')
    }
  })

  // Eliminar plan
  const deletePlan = useMutation({
    mutationFn: async (planId: string) => {
      const { error } = await supabase
        .from('subscription_plans')
        .delete()
        .eq('id', planId)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription-plans'] })
      toast.success('Plan eliminado exitosamente')
    },
    onError: (error) => {
      console.error('Error deleting plan:', error)
      toast.error('Error al eliminar el plan')
    }
  })

  return {
    plans,
    isLoading,
    createPlan,
    updatePlan,
    deletePlan,
    isCreating: createPlan.isPending,
    isUpdating: updatePlan.isPending,
    isDeleting: deletePlan.isPending
  }
}