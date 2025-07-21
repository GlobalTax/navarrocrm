
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useApp } from '@/contexts/AppContext'
import { toast } from 'sonner'
import { createLogger } from '@/utils/logger'
import { useMemo } from 'react'
import type { CreateCaseData, UpdateCaseData } from './types'

/**
 * Configuración de opciones para useCasesMutations
 * @interface UseCasesMutationsOptions
 */
export interface UseCasesMutationsOptions {
  /** Mostrar notificaciones toast */
  showToasts?: boolean
  /** Optimistic updates habilitados */
  optimisticUpdates?: boolean
  /** Callback de éxito personalizado */
  onSuccess?: (data: any) => void
  /** Callback de error personalizado */
  onError?: (error: Error) => void
  /** Invalidar queries automáticamente */
  autoInvalidate?: boolean
}

/**
 * Hook para mutaciones de casos (crear, actualizar, eliminar, archivar)
 * Proporciona operaciones CRUD completas con validación y manejo de errores
 * 
 * @param {UseCasesMutationsOptions} options - Opciones de configuración
 * @returns Objeto con funciones de mutación y estados de carga
 * 
 * @example
 * ```tsx
 * const {
 *   createCase,
 *   updateCase,
 *   deleteCase,
 *   archiveCase,
 *   isCreating
 * } = useCasesMutations({
 *   showToasts: true,
 *   optimisticUpdates: false
 * })
 * 
 * // Crear nuevo caso
 * createCase({
 *   title: 'Nuevo Caso',
 *   description: 'Descripción del caso',
 *   contact_id: contactId
 * })
 * ```
 * 
 * @throws {Error} Cuando no se puede acceder a los datos del usuario
 */
export const useCasesMutations = (options: UseCasesMutationsOptions = {}) => {
  const logger = createLogger('useCasesMutations')
  const { user } = useApp()
  const queryClient = useQueryClient()

  // Validación y configuración de opciones
  const validatedOptions = useMemo(() => {
    const defaults: Required<UseCasesMutationsOptions> = {
      showToasts: true,
      optimisticUpdates: false,
      onSuccess: () => {},
      onError: () => {},
      autoInvalidate: true
    }

    return { ...defaults, ...options }
  }, [options])

  // Validación de contexto
  if (!user) {
    logger.error('Usuario no encontrado en el contexto')
    throw new Error('Usuario no autenticado')
  }

  if (!user.org_id) {
    logger.warn('org_id no encontrado para el usuario', { userId: user.id })
  }

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
      console.error('❌ Error al crear caso:', error)
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
        console.error('❌ Error updating case:', error)
        throw error
      }

      
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

  const archiveCaseMutation = useMutation({
    mutationFn: async (caseId: string) => {
      console.log('📋 Archivando caso:', caseId)

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
        console.error('❌ Error archiving case:', error)
        throw error
      }

      console.log('✅ Caso archivado:', caseId)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cases'] })
      toast.success('Estado del caso actualizado exitosamente')
    },
    onError: (error) => {
      console.error('❌ Error al cambiar estado del caso:', error)
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
