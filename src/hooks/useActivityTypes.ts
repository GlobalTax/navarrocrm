
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { toast } from 'sonner'

export interface ActivityType {
  id: string
  name: string
  category: string
  color: string | null
  icon: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

const FALLBACK_TYPES: Pick<ActivityType, 'name' | 'category'>[] = [
  { name: 'Facturable', category: 'billable' },
  { name: 'Admin. Oficina', category: 'office_admin' },
  { name: 'Desarrollo Negocio', category: 'business_development' },
  { name: 'Interno', category: 'internal' },
]

export const useActivityTypes = () => {
  const queryClient = useQueryClient()

  const { data: activityTypes = [], isLoading } = useQuery({
    queryKey: ['activity-types'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('activity_types')
        .select('*')
        .order('name')

      if (error) throw error
      return data as ActivityType[]
    },
  })

  const activeTypes = activityTypes.filter(t => t.is_active)

  // If no types exist in DB, provide fallbacks for the UI
  const availableTypes = activeTypes.length > 0
    ? activeTypes
    : FALLBACK_TYPES.map((t, i) => ({
        id: t.category,
        name: t.name,
        category: t.category,
        color: null,
        icon: null,
        is_active: true,
        created_at: '',
        updated_at: '',
      }))

  const createType = useMutation({
    mutationFn: async (input: { name: string; category: string; color?: string; icon?: string }) => {
      const { data, error } = await supabase
        .from('activity_types')
        .insert({
          name: input.name,
          category: input.category,
          color: input.color || null,
          icon: input.icon || null,
        })
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activity-types'] })
      toast.success('Tipo de actividad creado')
    },
    onError: () => toast.error('Error al crear tipo de actividad'),
  })

  const updateType = useMutation({
    mutationFn: async (input: { id: string; name?: string; category?: string; color?: string; icon?: string; is_active?: boolean }) => {
      const { id, ...updates } = input
      const { data, error } = await supabase
        .from('activity_types')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activity-types'] })
      toast.success('Tipo de actividad actualizado')
    },
    onError: () => toast.error('Error al actualizar tipo de actividad'),
  })

  const toggleActive = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from('activity_types')
        .update({ is_active })
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activity-types'] })
      toast.success('Estado actualizado')
    },
    onError: () => toast.error('Error al cambiar estado'),
  })

  return {
    activityTypes,
    activeTypes,
    availableTypes,
    isLoading,
    createType,
    updateType,
    toggleActive,
  }
}
