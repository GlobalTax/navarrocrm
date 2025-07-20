
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useApp } from '@/contexts/AppContext'
import { toast } from 'sonner'
import type { Proposal } from '@/types/proposals'
import { createLogger } from '@/utils/logger'
import { createError, handleError } from '@/utils/errorHandler'

const logger = createLogger('UpdateProposalStatus')

export const useUpdateProposalStatus = (proposals: Proposal[], onProposalWon?: (proposal: any) => void) => {
  const { user } = useApp()
  const queryClient = useQueryClient()

  // Función para crear cuota recurrente cuando se acepta una propuesta
  const createRecurringFeeOnAcceptance = async (proposal: any, operationId: string) => {
    if (!proposal.is_recurring || !user?.id) {
      logger.debug('⏭️ Omitiendo creación de cuota recurrente', {
        operationId,
        proposalId: proposal.id,
        isRecurring: proposal.is_recurring,
        hasUser: !!user?.id
      })
      return
    }

    logger.info('💰 Creando cuota recurrente automática', {
      operationId,
      proposalId: proposal.id,
      proposalTitle: proposal.title
    })

    try {
      const recurringFeeData = {
        org_id: proposal.org_id,
        contact_id: proposal.contact_id,
        proposal_id: proposal.id,
        name: `Cuota recurrente - ${proposal.title}`,
        description: proposal.description || '',
        amount: proposal.retainer_amount || proposal.total_amount,
        frequency: proposal.recurring_frequency || 'monthly',
        start_date: proposal.contract_start_date || new Date().toISOString().split('T')[0],
        end_date: proposal.contract_end_date,
        next_billing_date: proposal.next_billing_date || proposal.contract_start_date || new Date().toISOString().split('T')[0],
        billing_day: proposal.billing_day || 1,
        included_hours: proposal.included_hours || 0,
        hourly_rate_extra: proposal.hourly_rate_extra || 0,
        auto_invoice: true,
        auto_send_notifications: true,
        payment_terms: 30,
        priority: 'medium',
        status: 'active',
        created_by: user.id
      }

      // Verificar si ya existe una cuota recurrente para esta propuesta
      const { data: existingFee } = await supabase
        .from('recurring_fees')
        .select('id')
        .eq('proposal_id', proposal.id)
        .maybeSingle()

      if (!existingFee) {
        const { error } = await supabase
          .from('recurring_fees')
          .insert(recurringFeeData)

        if (error) {
          logger.error('❌ Error creando cuota recurrente automática', {
            operationId,
            proposalId: proposal.id,
            error: error.message
          })
          
          if (error.code === '23505') {
            logger.warn('⚠️ Cuota recurrente ya existe', {
              operationId,
              proposalId: proposal.id
            })
          } else {
            toast.error('Error al crear cuota recurrente automática')
          }
        } else {
          logger.info('✅ Cuota recurrente creada automáticamente', {
            operationId,
            proposalId: proposal.id
          })
          toast.success('✅ Cuota recurrente creada automáticamente')
        }
      } else {
        logger.debug('ℹ️ Cuota recurrente ya existe', {
          operationId,
          proposalId: proposal.id,
          existingFeeId: existingFee.id
        })
      }
    } catch (error) {
      logger.error('💥 Error crítico creando cuota recurrente', {
        operationId,
        proposalId: proposal.id,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }

  const updateProposalStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const operationId = crypto.randomUUID()
      
      logger.info('🔄 Actualizando estado de propuesta', {
        operationId,
        proposalId: id,
        newStatus: status,
        userId: user?.id
      })

      try {
        const updateData: any = { 
          status,
          updated_at: new Date().toISOString()
        }

        // Si se acepta la propuesta, agregar fechas relevantes
        if (status === 'won') {
          updateData.accepted_at = new Date().toISOString()
          
          // Si no tiene fecha de inicio de contrato, usar la fecha actual
          const proposal = proposals.find(p => p.id === id)
          if (proposal?.is_recurring && !proposal.contract_start_date) {
            updateData.contract_start_date = new Date().toISOString().split('T')[0]
            
            logger.debug('📅 Estableciendo fecha de inicio de contrato', {
              operationId,
              proposalId: id,
              contractStartDate: updateData.contract_start_date
            })
          }
        }

        const { data, error } = await supabase
          .from('proposals')
          .update(updateData)
          .eq('id', id)
          .select()
          .maybeSingle()

        if (error) {
          logger.error('❌ Error actualizando estado de propuesta', {
            operationId,
            proposalId: id,
            error: error.message,
            code: error.code
          })

          if (error.code === '23503') {
            throw createError('Error de referencia', {
              severity: 'medium',
              userMessage: 'Error en las referencias de la propuesta',
              technicalMessage: error.message
            })
          } else if (error.code === '42501') {
            throw createError('Sin permisos', {
              severity: 'high',
              userMessage: 'No tienes permisos para actualizar esta propuesta',
              technicalMessage: error.message
            })
          } else {
            throw error
          }
        }

        logger.info('✅ Estado de propuesta actualizado', {
          operationId,
          proposalId: id,
          newStatus: status,
          acceptedAt: updateData.accepted_at
        })

        // Si se acepta una propuesta, crear la cuota recurrente y disparar onboarding
        if (status === 'won') {
          logger.info('🎉 Propuesta aceptada - iniciando procesos automáticos', {
            operationId,
            proposalId: id
          })

          await createRecurringFeeOnAcceptance(data, operationId)
          
          // Callback para iniciar onboarding
          if (onProposalWon) {
            logger.debug('🚀 Disparando callback de propuesta ganada', {
              operationId,
              proposalId: id
            })
            onProposalWon(data)
          }
        }

        return data
      } catch (error) {
        logger.error('💥 Error crítico actualizando propuesta', {
          operationId,
          proposalId: id,
          status,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
        throw error
      }
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['proposals'] })
      queryClient.invalidateQueries({ queryKey: ['recurring-fees'] })
      
      const statusText = variables.status === 'won' ? 'aceptada' : 
                        variables.status === 'lost' ? 'rechazada' : 
                        'actualizada'
      
      logger.info('🎊 Actualización de propuesta completada', {
        proposalId: variables.id,
        status: variables.status,
        statusText
      })
      
      toast.success(`Propuesta ${statusText} correctamente`)
    },
    onError: (error) => {
      handleError(error, 'UpdateProposalStatus')
    }
  })

  return {
    updateProposalStatus,
    isUpdating: updateProposalStatus.isPending
  }
}
