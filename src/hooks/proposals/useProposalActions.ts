
import { useState } from 'react'
import { toast } from 'sonner'
import { supabase } from '@/integrations/supabase/client'
import { useApp } from '@/contexts/AppContext'
import { useQueryClient } from '@tanstack/react-query'

export const useProposalActions = () => {
  const { user } = useApp()
  const queryClient = useQueryClient()
  const [isLoading, setIsLoading] = useState(false)

  const logProposalAction = async (proposalId: string, actionType: string, details?: string) => {
    try {
      const { error } = await supabase.rpc('log_proposal_action', {
        proposal_id_param: proposalId,
        action_type_param: actionType,
        details_param: details
      })
      
      if (error) {
        console.error('Error logging proposal action:', error)
      }
    } catch (error) {
      console.error('Error calling log_proposal_action:', error)
    }
  }

  const duplicateProposal = async (originalProposal: any) => {
    if (!user?.org_id) {
      toast.error('Usuario no autenticado')
      return
    }

    setIsLoading(true)
    
    try {
      // Generar nuevo número de propuesta
      const newProposalNumber = `${originalProposal.proposal_number || 'PROP'}-COPY-${Date.now()}`
      
      // Crear datos para la nueva propuesta
      const duplicateData = {
        ...originalProposal,
        id: undefined, // Remover ID para crear nueva
        title: `${originalProposal.title} (Copia)`,
        proposal_number: newProposalNumber,
        status: 'draft',
        sent_at: null,
        accepted_at: null,
        valid_until: null, // Limpiar fecha de validez
        created_at: undefined,
        updated_at: undefined,
        // Limpiar fechas específicas para recurrentes
        contract_start_date: null,
        contract_end_date: null,
        next_billing_date: null,
      }

      const { data, error } = await supabase
        .from('proposals')
        .insert(duplicateData)
        .select()
        .maybeSingle()

      if (error) throw error

      // Si la propuesta original tenía line items, duplicarlos también
      if (originalProposal.line_items && originalProposal.line_items.length > 0) {
        const lineItemsToInsert = originalProposal.line_items.map((item: any) => ({
          ...item,
          id: undefined,
          proposal_id: data.id
        }))

        const { error: lineItemsError } = await supabase
          .from('proposal_line_items')
          .insert(lineItemsToInsert)

        if (lineItemsError) {
          console.error('Error duplicating line items:', lineItemsError)
          // No lanzar error, solo advertir
          toast.error('Propuesta duplicada, pero hubo un problema con los elementos de línea')
        }
      }

      // Registrar la acción de duplicado
      await logProposalAction(
        data.id, 
        'duplicated', 
        `Duplicada desde "${originalProposal.title}" (${originalProposal.proposal_number})`
      )

      await queryClient.invalidateQueries({ queryKey: ['proposals'] })
      await queryClient.invalidateQueries({ queryKey: ['proposal-history'] })
      toast.success(`Propuesta "${data.title}" duplicada exitosamente`)
      
      return data
    } catch (error: any) {
      console.error('Error duplicating proposal:', error)
      toast.error(`Error al duplicar propuesta: ${error.message}`)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const validateStatusTransition = (currentStatus: string, newStatus: string): boolean => {
    const validTransitions: Record<string, string[]> = {
      'draft': ['sent', 'lost'],
      'sent': ['negotiating', 'won', 'lost', 'expired'],
      'negotiating': ['won', 'lost', 'sent'],
      'won': ['lost'], // Solo en casos excepcionales
      'lost': ['draft'], // Para reactivar
      'expired': ['draft', 'sent']
    }

    return validTransitions[currentStatus]?.includes(newStatus) || false
  }

  const updateProposalStatus = async (proposalId: string, currentStatus: string, newStatus: string) => {
    if (!validateStatusTransition(currentStatus, newStatus)) {
      toast.error(`No se puede cambiar de ${currentStatus} a ${newStatus}`)
      return false
    }

    setIsLoading(true)
    
    try {
      const updateData: any = { 
        status: newStatus,
        updated_at: new Date().toISOString()
      }

      // Agregar timestamps según el estado
      if (newStatus === 'sent' && !currentStatus.includes('sent')) {
        updateData.sent_at = new Date().toISOString()
      }
      if (newStatus === 'won') {
        updateData.accepted_at = new Date().toISOString()
      }

      const { error } = await supabase
        .from('proposals')
        .update(updateData)
        .eq('id', proposalId)

      if (error) throw error

      // Registrar la acción manualmente para acciones específicas
      if (newStatus === 'sent') {
        await logProposalAction(proposalId, 'sent', 'Propuesta enviada al cliente')
      } else if (newStatus === 'won') {
        await logProposalAction(proposalId, 'accepted', 'Propuesta aceptada por el cliente')
      }

      await queryClient.invalidateQueries({ queryKey: ['proposals'] })
      await queryClient.invalidateQueries({ queryKey: ['proposal-history'] })
      toast.success('Estado actualizado correctamente')
      
      return true
    } catch (error: any) {
      console.error('Error updating proposal status:', error)
      toast.error(`Error al actualizar estado: ${error.message}`)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const updateProposal = async (proposalId: string, proposalData: any) => {
    if (!user?.org_id) {
      toast.error('Usuario no autenticado')
      return
    }

    setIsLoading(true)
    
    try {
      // Separar line_items y campos que no son columnas de la BD
      const { line_items, clientId, client, contact, selectedServices, client_id, retainerConfig, ...rest } = proposalData
      
      // Construir datos limpios para la BD
      const cleanData: Record<string, any> = { ...rest }
      
      // Mapear clientId (camelCase del formulario) a contact_id (columna BD)
      if (clientId) {
        cleanData.contact_id = clientId
      }
      
      // Actualizar la propuesta principal
      const { error: updateError } = await supabase
        .from('proposals')
        .update({
          ...cleanData,
          updated_at: new Date().toISOString()
        })
        .eq('id', proposalId)

      if (updateError) throw updateError

      // Si hay line_items, actualizar/crear/eliminar según sea necesario
      if (line_items) {
        // Primero eliminar todos los line_items existentes
        const { error: deleteError } = await supabase
          .from('proposal_line_items')
          .delete()
          .eq('proposal_id', proposalId)

        if (deleteError) throw deleteError

        // Luego insertar los nuevos line_items
        if (line_items.length > 0) {
          const lineItemsToInsert = line_items.map((item: any) => ({
            ...item,
            proposal_id: proposalId,
            id: undefined // Generar nuevo ID
          }))

          const { error: insertError } = await supabase
            .from('proposal_line_items')
            .insert(lineItemsToInsert)

          if (insertError) throw insertError
        }
      }

      // Registrar la acción de actualización
      await logProposalAction(
        proposalId, 
        'updated', 
        'Propuesta actualizada manualmente'
      )

      await queryClient.invalidateQueries({ queryKey: ['proposals'] })
      await queryClient.invalidateQueries({ queryKey: ['proposal-history'] })
      toast.success('Propuesta actualizada exitosamente')
      
      return true
    } catch (error: any) {
      console.error('Error updating proposal:', error)
      toast.error(`Error al actualizar propuesta: ${error.message}`)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const deleteProposal = async (proposalId: string, proposalTitle?: string) => {
    setIsLoading(true)
    try {
      // Eliminar line items primero (FK)
      const { error: lineItemsError } = await supabase
        .from('proposal_line_items')
        .delete()
        .eq('proposal_id', proposalId)

      if (lineItemsError) throw lineItemsError

      // Eliminar la propuesta
      const { error } = await supabase
        .from('proposals')
        .delete()
        .eq('id', proposalId)

      if (error) throw error

      await queryClient.invalidateQueries({ queryKey: ['proposals'] })
      await queryClient.invalidateQueries({ queryKey: ['proposal-history'] })
      toast.success('Propuesta eliminada correctamente')
    } catch (error: any) {
      console.error('Error deleting proposal:', error)
      toast.error(`Error al eliminar propuesta: ${error.message}`)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  return {
    duplicateProposal,
    deleteProposal,
    updateProposalStatus,
    updateProposal,
    validateStatusTransition,
    logProposalAction,
    isLoading
  }
}
