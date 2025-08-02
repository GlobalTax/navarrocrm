
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useApp } from '@/contexts/AppContext'
import { toast } from 'sonner'
import { casesLogger } from '@/utils/logging'
import type { CreateCaseData, UpdateCaseData } from './types'

export const useCasesMutations = () => {
  const { user } = useApp()
  const queryClient = useQueryClient()

  const createCaseMutation = useMutation({
    mutationFn: async (caseData: CreateCaseData) => {
      if (!user?.id || !user?.org_id) {
        throw new Error('Usuario no autenticado')
      }

      

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
        .maybeSingle()

      if (error) {
        
        throw error
      }

      
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cases'] })
      toast.success('Caso creado exitosamente')
    },
    onError: (error) => {
      casesLogger.error('Error al crear caso', { error })
      toast.error('Error al crear el caso')
    },
  })

  const updateCaseMutation = useMutation({
    mutationFn: async ({ id, ...updateData }: UpdateCaseData) => {
      

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
        .maybeSingle()

      if (error) {
        casesLogger.error('Error updating case', { error })
        throw error
      }

      
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cases'] })
      toast.success('Caso actualizado exitosamente')
    },
    onError: (error) => {
      casesLogger.error('Error al actualizar caso', { error })
      toast.error('Error al actualizar el caso')
    },
  })

  const deleteCaseMutation = useMutation({
    mutationFn: async (caseId: string) => {
      

      const { error } = await supabase
        .from('cases')
        .delete()
        .eq('id', caseId)

      if (error) {
        casesLogger.error('Error deleting case', { error })
        throw error
      }

      casesLogger.info('Caso eliminado', { caseId })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cases'] })
      toast.success('Caso eliminado exitosamente')
    },
    onError: (error) => {
      casesLogger.error('Error al eliminar caso', { error })
      toast.error('Error al eliminar el caso')
    },
  })

  const archiveCaseMutation = useMutation({
    mutationFn: async (caseId: string) => {
      casesLogger.info('Archivando caso', { caseId })

      // Get current case status first
      const { data: currentCase } = await supabase
        .from('cases')
        .select('status')
        .eq('id', caseId)
        .maybeSingle()

      // Toggle between closed and open
      const newStatus = currentCase?.status === 'closed' ? 'open' : 'closed'

      const { error } = await supabase
        .from('cases')
        .update({ status: newStatus })
        .eq('id', caseId)

      if (error) {
        casesLogger.error('Error archiving case', { error })
        throw error
      }

      casesLogger.info('Caso archivado', { caseId })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cases'] })
      toast.success('Estado del caso actualizado exitosamente')
    },
    onError: (error) => {
      casesLogger.error('Error al cambiar estado del caso', { error })
      toast.error('Error al cambiar el estado del caso')
    },
  })

  return {
    createCase: createCaseMutation.mutate,
    updateCase: updateCaseMutation.mutate,
    deleteCase: deleteCaseMutation.mutate,
    archiveCase: archiveCaseMutation.mutate,
    isCreating: createCaseMutation.isPending,
    isUpdating: updateCaseMutation.isPending,
    isDeleting: deleteCaseMutation.isPending,
    isArchiving: archiveCaseMutation.isPending,
    isCreateSuccess: createCaseMutation.isSuccess,
    createCaseReset: () => createCaseMutation.reset()
  }
}
