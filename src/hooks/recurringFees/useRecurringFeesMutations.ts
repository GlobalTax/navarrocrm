import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useApp } from '@/contexts/AppContext'
import { toast } from 'sonner'
import type { RecurringFee } from '@/types/recurringFees'
import { createLogger } from '@/utils/logger'
import { createError, handleError } from '@/utils/errorHandler'

const logger = createLogger('RecurringFeesMutations')

export const useCreateRecurringFee = () => {
  const { user } = useApp()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: Omit<RecurringFee, 'id' | 'org_id' | 'created_at' | 'updated_at' | 'created_by'>) => {
      const operationId = crypto.randomUUID()
      
      logger.info('🆕 Creando nueva cuota recurrente', {
        operationId,
        clientId: data.client_id,
        amount: data.amount,
        frequency: data.frequency,
        includedHours: data.included_hours
      })

      if (!user?.org_id || !user?.id) {
        const authError = createError('Error de autenticación', {
          severity: 'high',
          userMessage: 'Usuario no autenticado',
          technicalMessage: 'Missing user.org_id or user.id'
        })
        
        logger.error('❌ Error de autenticación', {
          operationId,
          hasUser: !!user,
          hasOrgId: !!user?.org_id,
          hasUserId: !!user?.id
        })
        
        throw authError
      }

      try {
        // Convert client_id to contact_id for database compatibility
        const { client_id, client, ...cleanData } = data
        const insertData = {
          ...cleanData,
          contact_id: client_id,
          org_id: user.org_id,
          created_by: user.id
        }

        logger.debug('💾 Insertando cuota recurrente', {
          operationId,
          contactId: insertData.contact_id,
          name: insertData.name,
          amount: insertData.amount
        })

        const { data: result, error } = await supabase
          .from('recurring_fees')
          .insert(insertData)
          .select()
          .maybeSingle()

        if (error) {
          logger.error('❌ Error al insertar cuota recurrente', {
            operationId,
            error: error.message,
            code: error.code,
            details: error.details
          })

          if (error.code === '23505') {
            throw createError('Cuota recurrente duplicada', {
              severity: 'medium',
              userMessage: 'Ya existe una cuota recurrente similar para este cliente',
              technicalMessage: error.message
            })
          } else if (error.code === '23503') {
            throw createError('Cliente no válido', {
              severity: 'medium',
              userMessage: 'El cliente seleccionado no es válido',
              technicalMessage: error.message
            })
          } else {
            throw error
          }
        }

        // Crear tarea mensual automática para el responsable si hay horas incluidas
        if (result && data.included_hours > 0) {
          logger.info('📋 Creando tarea automática para gestión de horas', {
            operationId,
            recurringFeeId: result.id,
            includedHours: data.included_hours
          })

          try {
            // Buscar un usuario responsable (área manager o partner)
            const { data: responsibleUser, error: userError } = await supabase
              .from('users')
              .select('id, email')
              .eq('org_id', user.org_id)
              .in('role', ['area_manager', 'partner'])
              .limit(1)
              .maybeSingle()

            // Buscar casos activos del cliente para encontrar el responsable
            const { data: activeCase, error: caseError } = await supabase
              .from('cases')
              .select('responsible_solicitor_id')
              .eq('contact_id', client_id)
              .eq('status', 'open')
              .limit(1)
              .maybeSingle()

            if (!userError && responsibleUser) {
              // Calcular próxima fecha de vencimiento (1 mes desde hoy)
              const nextDueDate = new Date()
              nextDueDate.setMonth(nextDueDate.getMonth() + 1)
              
              // Crear tarea mensual recurrente
              const { data: task, error: taskError } = await supabase
                .from('tasks')
                .insert({
                  title: `Gestión cuota recurrente - ${data.name}`,
                  description: `Gestión mensual de la cuota recurrente "${data.name}" de ${data.included_hours} horas. Revisar consumo y facturación.`,
                  org_id: user.org_id,
                  contact_id: client_id,
                  priority: 'medium',
                  status: 'pending',
                  estimated_hours: data.included_hours,
                  due_date: nextDueDate.toISOString().split('T')[0],
                  created_by: user.id
                })
                .select()
                .maybeSingle()

              if (!taskError && task) {
                // Preparar asignaciones: responsable + gestor de cuenta
                const assignments = [
                  {
                    task_id: task.id,
                    user_id: responsibleUser.id,
                    assigned_by: user.id
                  }
                ]

                // Asignar también al responsable de la cuenta si existe y es diferente
                if (!caseError && activeCase?.responsible_solicitor_id && 
                    activeCase.responsible_solicitor_id !== responsibleUser.id) {
                  assignments.push({
                    task_id: task.id,
                    user_id: activeCase.responsible_solicitor_id,
                    assigned_by: user.id
                  })
                }

                await supabase
                  .from('task_assignments')
                  .insert(assignments)

                logger.info('✅ Tarea automática creada exitosamente', {
                  operationId,
                  taskId: task.id,
                  assignmentsCount: assignments.length
                })
              } else if (taskError) {
                logger.warn('⚠️ Error creando tarea automática', {
                  operationId,
                  error: taskError.message
                })
              }
            } else {
              logger.warn('⚠️ No se encontró usuario responsable para crear tarea', {
                operationId
              })
            }
          } catch (taskCreationError) {
            logger.error('❌ Error en creación de tarea automática', {
              operationId,
              error: taskCreationError instanceof Error ? taskCreationError.message : 'Unknown error'
            })
            // No fallar la operación principal por esto
          }
        }

        logger.info('✅ Cuota recurrente creada exitosamente', {
          operationId,
          recurringFeeId: result.id,
          name: result.name
        })

        return result
      } catch (error) {
        logger.error('💥 Error crítico al crear cuota recurrente', {
          operationId,
          error: error instanceof Error ? error.message : 'Unknown error',
          clientId: data.client_id
        })
        throw error
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurring-fees'] })
      toast.success('Cuota recurrente creada correctamente')
    },
    onError: (error: any) => {
      handleError(error, 'CreateRecurringFee')
    }
  })
}

export const useUpdateRecurringFee = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<RecurringFee> }) => {
      const operationId = crypto.randomUUID()
      
      logger.info('✏️ Actualizando cuota recurrente', {
        operationId,
        recurringFeeId: id,
        updateFields: Object.keys(data)
      })

      try {
        // Convert client_id to contact_id for database compatibility
        const { client_id, client, ...cleanData } = data
        const updateData = client_id ? { ...cleanData, contact_id: client_id } : cleanData

        const { data: result, error } = await supabase
          .from('recurring_fees')
          .update(updateData)
          .eq('id', id)
          .select()
          .maybeSingle()

        if (error) {
          logger.error('❌ Error al actualizar cuota recurrente', {
            operationId,
            recurringFeeId: id,
            error: error.message,
            code: error.code
          })

          if (error.code === '23505') {
            throw createError('Conflicto al actualizar', {
              severity: 'medium',
              userMessage: 'Los datos actualizados entran en conflicto con otro registro',
              technicalMessage: error.message
            })
          } else {
            throw error
          }
        }

        logger.info('✅ Cuota recurrente actualizada exitosamente', {
          operationId,
          recurringFeeId: id
        })

        return result
      } catch (error) {
        logger.error('💥 Error crítico al actualizar cuota recurrente', {
          operationId,
          recurringFeeId: id,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
        throw error
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurring-fees'] })
      queryClient.invalidateQueries({ queryKey: ['recurring-fee'] })
      toast.success('Cuota recurrente actualizada correctamente')
    },
    onError: (error: any) => {
      handleError(error, 'UpdateRecurringFee')
    }
  })
}

export const useDeleteRecurringFee = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const operationId = crypto.randomUUID()
      
      logger.info('🗑️ Eliminando cuota recurrente', {
        operationId,
        recurringFeeId: id
      })

      try {
        const { error } = await supabase
          .from('recurring_fees')
          .delete()
          .eq('id', id)

        if (error) {
          logger.error('❌ Error al eliminar cuota recurrente', {
            operationId,
            recurringFeeId: id,
            error: error.message,
            code: error.code
          })

          if (error.code === '23503') {
            throw createError('No se puede eliminar', {
              severity: 'medium',
              userMessage: 'La cuota recurrente tiene registros asociados y no se puede eliminar',
              technicalMessage: error.message
            })
          } else {
            throw error
          }
        }

        logger.info('✅ Cuota recurrente eliminada exitosamente', {
          operationId,
          recurringFeeId: id
        })
      } catch (error) {
        logger.error('💥 Error crítico al eliminar cuota recurrente', {
          operationId,
          recurringFeeId: id,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
        throw error
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurring-fees'] })
      toast.success('Cuota recurrente eliminada correctamente')
    },
    onError: (error: any) => {
      handleError(error, 'DeleteRecurringFee')
    }
  })
}

export const useGenerateInvoices = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      const operationId = crypto.randomUUID()
      
      logger.info('📄 Generando facturas recurrentes', { operationId })

      try {
        const { data, error } = await supabase.rpc('generate_recurring_invoices')
        
        if (error) {
          logger.error('❌ Error al generar facturas', {
            operationId,
            error: error.message
          })
          throw error
        }

        logger.info('✅ Facturas generadas exitosamente', {
          operationId,
          invoicesGenerated: data
        })

        return data
      } catch (error) {
        logger.error('💥 Error crítico generando facturas', {
          operationId,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
        throw error
      }
    },
    onSuccess: (invoicesGenerated) => {
      queryClient.invalidateQueries({ queryKey: ['recurring-fee-invoices'] })
      toast.success(`Se generaron ${invoicesGenerated} facturas automáticamente`)
    },
    onError: (error: any) => {
      handleError(error, 'GenerateInvoices')
    }
  })
}

export const useCreateRecurringFeeFromProposal = () => {
  const { user } = useApp()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (proposalId: string) => {
      const operationId = crypto.randomUUID()
      
      logger.info('📋 Creando cuota recurrente desde propuesta', {
        operationId,
        proposalId
      })

      if (!user?.org_id || !user?.id) {
        throw createError('Usuario no autenticado', {
          severity: 'high',
          userMessage: 'Usuario no autenticado',
          technicalMessage: 'Missing user credentials'
        })
      }

      try {
        // Obtener datos de la propuesta
        const { data: proposal, error: proposalError } = await supabase
          .from('proposals')
          .select('*')
          .eq('id', proposalId)
          .eq('org_id', user.org_id)
          .maybeSingle()

        if (proposalError) {
          logger.error('❌ Error al obtener propuesta', {
            operationId,
            proposalId,
            error: proposalError.message
          })
          throw proposalError
        }

        if (!proposal) {
          throw createError('Propuesta no encontrada', {
            severity: 'medium',
            userMessage: 'La propuesta no existe o no tienes permisos para acceder a ella',
            technicalMessage: 'Proposal not found or access denied'
          })
        }

        // Crear cuota recurrente basada en la propuesta
        const recurringFeeData = {
          org_id: user.org_id,
          contact_id: proposal.contact_id,
          proposal_id: proposal.id,
          name: `Cuota recurrente - ${proposal.title}`,
          description: proposal.description || '',
          amount: proposal.retainer_amount || proposal.total_amount,
          frequency: proposal.recurring_frequency as 'monthly' | 'quarterly' | 'yearly',
          start_date: proposal.contract_start_date || new Date().toISOString().split('T')[0],
          end_date: proposal.contract_end_date,
          next_billing_date: proposal.next_billing_date || proposal.contract_start_date || new Date().toISOString().split('T')[0],
          billing_day: proposal.billing_day || 1,
          included_hours: proposal.included_hours || 0,
          hourly_rate_extra: proposal.hourly_rate_extra || 0,
          auto_invoice: true,
          auto_send_notifications: true,
          payment_terms: 30,
          priority: 'medium' as const,
          status: 'active' as const,
          created_by: user.id
        }

        logger.debug('💾 Insertando cuota recurrente desde propuesta', {
          operationId,
          proposalId,
          recurringFeeData: {
            name: recurringFeeData.name,
            amount: recurringFeeData.amount,
            frequency: recurringFeeData.frequency
          }
        })

        const { data: result, error } = await supabase
          .from('recurring_fees')
          .insert(recurringFeeData)
          .select()
          .maybeSingle()

        if (error) {
          logger.error('❌ Error al crear cuota desde propuesta', {
            operationId,
            proposalId,
            error: error.message
          })
          throw error
        }

        logger.info('✅ Cuota recurrente creada desde propuesta', {
          operationId,
          proposalId,
          recurringFeeId: result.id
        })

        return result
      } catch (error) {
        logger.error('💥 Error crítico creando cuota desde propuesta', {
          operationId,
          proposalId,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
        throw error
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurring-fees'] })
      toast.success('Cuota recurrente creada desde propuesta')
    },
    onError: (error: any) => {
      handleError(error, 'CreateRecurringFeeFromProposal')
    }
  })
}
