/**
 * useCasesMutations - Hook para mutaciones de casos
 */

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useApp } from '@/contexts/AppContext'
import { toast } from 'sonner'
import { casesService } from '../services'
import { CreateCaseData, UpdateCaseData } from '../types'

export const useCasesMutations = () => {
  const { user } = useApp()
  const queryClient = useQueryClient()

  const createCaseMutation = useMutation({
    mutationFn: async (caseData: CreateCaseData) => {
      if (!user?.id || !user?.org_id) {
        throw new Error('Usuario no autenticado')
      }

      return await casesService.createCase(caseData, user.org_id, user.id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cases'] })
      toast.success('Caso creado exitosamente')
    },
    onError: (error) => {
      console.error('Error al crear caso', { error })
      toast.error('Error al crear el caso')
    },
  })

  const updateCaseMutation = useMutation({
    mutationFn: async ({ id, ...updateData }: UpdateCaseData) => {
      if (!user?.org_id) {
        throw new Error('Usuario no autenticado')
      }

      return await casesService.updateCase(id, updateData, user.org_id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cases'] })
      toast.success('Caso actualizado exitosamente')
    },
    onError: (error) => {
      console.error('Error al actualizar caso', { error })
      toast.error('Error al actualizar el caso')
    },
  })

  const deleteCaseMutation = useMutation({
    mutationFn: async (caseId: string) => {
      if (!user?.org_id) {
        throw new Error('Usuario no autenticado')
      }

      await casesService.deleteCase(caseId, user.org_id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cases'] })
      toast.success('Caso eliminado exitosamente')
    },
    onError: (error) => {
      console.error('Error al eliminar caso', { error })
      toast.error('Error al eliminar el caso')
    },
  })

  const archiveCaseMutation = useMutation({
    mutationFn: async (caseId: string) => {
      if (!user?.org_id) {
        throw new Error('Usuario no autenticado')
      }

      return await casesService.toggleCaseStatus(caseId, user.org_id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cases'] })
      toast.success('Estado del caso actualizado exitosamente')
    },
    onError: (error) => {
      console.error('Error al cambiar estado del caso', { error })
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