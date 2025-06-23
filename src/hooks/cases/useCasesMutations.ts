
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useApp } from '@/contexts/AppContext'
import { toast } from 'sonner'
import type { CreateCaseData, UpdateCaseData } from './types'

export const useCasesMutations = () => {
  const { user } = useApp()
  const queryClient = useQueryClient()

  const createCaseMutation = useMutation({
    mutationFn: async (caseData: CreateCaseData) => {
      if (!user?.id || !user?.org_id) {
        throw new Error('Usuario no autenticado')
      }

      console.log('📋 Creando caso:', caseData)

      // Prepare data for insertion, making sure contact_id has a default value
      const insertData = {
        title: caseData.title,
        description: caseData.description,
        status: caseData.status,
        contact_id: caseData.contact_id || user.id, // Use user ID as fallback
        practice_area: caseData.practice_area,
        responsible_solicitor_id: caseData.responsible_solicitor_id,
        originating_solicitor_id: caseData.originating_solicitor_id,
        billing_method: caseData.billing_method,
        estimated_budget: caseData.estimated_budget,
        org_id: user.org_id
      }

      const { data, error } = await supabase
        .from('cases')
        .insert(insertData)
        .select(`
          *,
          contact:contacts(
            id,
            name,
            email,
            phone
          )
        `)
        .single()

      if (error) {
        console.error('❌ Error creating case:', error)
        throw error
      }

      console.log('✅ Caso creado:', data)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cases'] })
      toast.success('Caso creado exitosamente')
    },
    onError: (error) => {
      console.error('❌ Error al crear caso:', error)
      toast.error('Error al crear el caso')
    },
  })

  const updateCaseMutation = useMutation({
    mutationFn: async ({ id, ...updateData }: UpdateCaseData) => {
      console.log('📋 Actualizando caso:', id, updateData)

      const { data, error } = await supabase
        .from('cases')
        .update(updateData)
        .eq('id', id)
        .select(`
          *,
          contact:contacts(
            id,
            name,
            email,
            phone
          )
        `)
        .single()

      if (error) {
        console.error('❌ Error updating case:', error)
        throw error
      }

      console.log('✅ Caso actualizado:', data)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cases'] })
      toast.success('Caso actualizado exitosamente')
    },
    onError: (error) => {
      console.error('❌ Error al actualizar caso:', error)
      toast.error('Error al actualizar el caso')
    },
  })

  const deleteCaseMutation = useMutation({
    mutationFn: async (caseId: string) => {
      console.log('📋 Eliminando caso:', caseId)

      const { error } = await supabase
        .from('cases')
        .delete()
        .eq('id', caseId)

      if (error) {
        console.error('❌ Error deleting case:', error)
        throw error
      }

      console.log('✅ Caso eliminado:', caseId)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cases'] })
      toast.success('Caso eliminado exitosamente')
    },
    onError: (error) => {
      console.error('❌ Error al eliminar caso:', error)
      toast.error('Error al eliminar el caso')
    },
  })

  return {
    createCase: createCaseMutation.mutate,
    updateCase: updateCaseMutation.mutate,
    deleteCase: deleteCaseMutation.mutate,
    isCreating: createCaseMutation.isPending,
    isUpdating: updateCaseMutation.isPending,
    isDeleting: deleteCaseMutation.isPending,
    isCreateSuccess: createCaseMutation.isSuccess,
    resetCreate: () => createCaseMutation.reset()
  }
}
