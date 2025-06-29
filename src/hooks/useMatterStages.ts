
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useApp } from '@/contexts/AppContext'
import { toast } from 'sonner'

export interface MatterStage {
  id: string
  name: string
  description?: string
  case_id: string
  status: 'pending' | 'in_progress' | 'completed'
  sort_order: number
  due_date?: string
  completed_at?: string
  created_at: string
  updated_at: string
  org_id: string
}

export interface CreateMatterStageData {
  name: string
  description?: string
  case_id: string
  due_date?: string
  sort_order?: number
}

export interface UpdateMatterStageData extends Partial<CreateMatterStageData> {
  id: string
  status?: 'pending' | 'in_progress' | 'completed'
}

export const useMatterStages = (caseId?: string) => {
  const { user } = useApp()
  const queryClient = useQueryClient()

  // Obtener etapas
  const { data: stages = [], isLoading, error, refetch } = useQuery({
    queryKey: ['matter-stages', caseId, user?.org_id],
    queryFn: async () => {
      if (!user?.org_id) return []
      
      let query = supabase
        .from('matter_stages')
        .select('*')
        .order('sort_order', { ascending: true })

      if (caseId) {
        query = query.eq('case_id', caseId)
      }

      const { data, error } = await query

      if (error) {
        console.error('Error fetching matter stages:', error)
        throw error
      }

      return (data || []) as MatterStage[]
    },
    enabled: !!user?.org_id,
  })

  // Crear etapa
  const createStageMutation = useMutation({
    mutationFn: async (stageData: CreateMatterStageData) => {
      if (!user?.org_id) throw new Error('Usuario no autenticado')

      const { data, error } = await supabase
        .from('matter_stages')
        .insert({
          ...stageData,
          org_id: user.org_id,
          sort_order: stageData.sort_order || stages.length
        })
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['matter-stages'] })
      toast.success('Etapa creada exitosamente')
    },
    onError: (error) => {
      console.error('Error creating stage:', error)
      toast.error('Error al crear la etapa')
    },
  })

  // Actualizar etapa
  const updateStageMutation = useMutation({
    mutationFn: async ({ id, ...updateData }: UpdateMatterStageData) => {
      const updateFields: any = { ...updateData }
      
      // Si se marca como completada, agregar timestamp
      if (updateData.status === 'completed' && !stages.find(s => s.id === id)?.completed_at) {
        updateFields.completed_at = new Date().toISOString()
      }
      
      // Si se cambia de completada a otro estado, limpiar timestamp
      if (updateData.status && updateData.status !== 'completed') {
        updateFields.completed_at = null
      }

      const { data, error } = await supabase
        .from('matter_stages')
        .update(updateFields)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['matter-stages'] })
      toast.success('Etapa actualizada exitosamente')
    },
    onError: (error) => {
      console.error('Error updating stage:', error)
      toast.error('Error al actualizar la etapa')
    },
  })

  // Eliminar etapa
  const deleteStageMutation = useMutation({
    mutationFn: async (stageId: string) => {
      const { error } = await supabase
        .from('matter_stages')
        .delete()
        .eq('id', stageId)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['matter-stages'] })
      toast.success('Etapa eliminada exitosamente')
    },
    onError: (error) => {
      console.error('Error deleting stage:', error)
      toast.error('Error al eliminar la etapa')
    },
  })

  // Reordenar etapas
  const reorderStagesMutation = useMutation({
    mutationFn: async (reorderedStages: { id: string; sort_order: number }[]) => {
      const updates = reorderedStages.map(stage => 
        supabase
          .from('matter_stages')
          .update({ sort_order: stage.sort_order })
          .eq('id', stage.id)
      )

      await Promise.all(updates)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['matter-stages'] })
      toast.success('Orden de etapas actualizado')
    },
    onError: (error) => {
      console.error('Error reordering stages:', error)
      toast.error('Error al reordenar las etapas')
    },
  })

  return {
    stages,
    isLoading,
    error,
    refetch,
    createStage: createStageMutation.mutate,
    updateStage: updateStageMutation.mutate,
    deleteStage: deleteStageMutation.mutate,
    reorderStages: reorderStagesMutation.mutate,
    isCreating: createStageMutation.isPending,
    isUpdating: updateStageMutation.isPending,
    isDeleting: deleteStageMutation.isPending,
    isReordering: reorderStagesMutation.isPending,
  }
}
