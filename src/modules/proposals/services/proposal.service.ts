
import { supabase } from '@/integrations/supabase/client'
import type { ProposalFormData } from '../types/proposal.schema'
import { transformLineItemsToServices, validateProposalData } from '../utils/dataTransformer'
import { createLogger } from '@/utils/logger'
import { createError, handleError } from '@/utils/errorHandler'

const logger = createLogger('ProposalService')

export const saveProposal = async (proposalData: ProposalFormData | any) => {
  const operationId = crypto.randomUUID()
  
  logger.info('💾 Iniciando guardado de propuesta', {
    operationId,
    hasSelectedServices: !!proposalData.selectedServices,
    hasLineItems: !!proposalData.line_items,
    isRecurring: proposalData.is_recurring
  })

  try {
    // Fase 1: Validación de datos
    logger.info('🔍 Fase 1: Validando datos de propuesta', { operationId })
    
    const validationErrors = validateProposalData(proposalData)
    if (validationErrors.length > 0) {
      throw createError('Errores de validación en propuesta', {
        severity: 'medium',
        userMessage: `Errores de validación: ${validationErrors.join(', ')}`,
        technicalMessage: `Validation failed: ${validationErrors.join(', ')}`
      })
    }

    logger.debug('✅ Validación de datos exitosa', {
      operationId,
      validationsPassed: true
    })

    // Fase 2: Autenticación y permisos
    logger.info('👤 Fase 2: Verificando autenticación', { operationId })
    
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      throw createError('Error de autenticación', {
        severity: 'high',
        userMessage: 'Usuario no autenticado',
        technicalMessage: userError?.message || 'No user found'
      })
    }

    const { data: userData, error: userDataError } = await supabase
      .from('users')
      .select('org_id')
      .eq('id', user.id)
      .single()

    if (userDataError || !userData) {
      throw createError('Error al obtener datos de usuario', {
        severity: 'high',
        userMessage: 'No se pudo obtener información del usuario',
        technicalMessage: userDataError?.message || 'User data not found'
      })
    }

    logger.debug('✅ Autenticación verificada', {
      operationId,
      userId: user.id,
      orgId: userData.org_id
    })

    // Fase 3: Procesamiento de servicios
    logger.info('⚙️ Fase 3: Procesando servicios', { operationId })
    
    let services: any[] = []
    
    if (proposalData.selectedServices && Array.isArray(proposalData.selectedServices)) {
      services = proposalData.selectedServices
      logger.debug('📋 Usando selectedServices', {
        operationId,
        serviceCount: services.length
      })
    } else if (proposalData.line_items && Array.isArray(proposalData.line_items)) {
      services = transformLineItemsToServices(proposalData.line_items)
      logger.debug('🔄 Transformando line_items a servicios', {
        operationId,
        originalCount: proposalData.line_items.length,
        transformedCount: services.length
      })
    }
    
    // Fase 4: Cálculo de totales
    logger.info('💰 Fase 4: Calculando totales', { operationId })
    
    const totalAmount = services.reduce((sum, service) => {
      return sum + (service.total || service.customPrice || service.basePrice || 0)
    }, 0)

    logger.debug('✅ Totales calculados', {
      operationId,
      serviceCount: services.length,
      totalAmount,
      breakdown: services.map(s => ({
        name: s.name,
        amount: s.total || s.customPrice || s.basePrice || 0
      }))
    })

    // Fase 5: Preparación de datos para inserción
    logger.info('📝 Fase 5: Preparando datos para inserción', { operationId })
    
    const proposalInsert = {
      org_id: userData.org_id,
      created_by: user.id,
      contact_id: proposalData.clientId || proposalData.contact_id,
      title: proposalData.title,
      description: proposalData.introduction || proposalData.description || '',
      total_amount: totalAmount,
      status: 'draft' as const,
      is_recurring: proposalData.is_recurring || false,
      recurring_frequency: proposalData.recurring_frequency || null,
      auto_renewal: proposalData.retainerConfig?.autoRenewal || proposalData.auto_renewal || false,
      scope_of_work: proposalData.terms || proposalData.scope_of_work || '',
      valid_until: proposalData.validUntil 
        ? new Date(proposalData.validUntil).toISOString()
        : proposalData.valid_until
        ? new Date(proposalData.valid_until).toISOString()
        : new Date(Date.now() + (proposalData.validityDays || 30) * 24 * 60 * 60 * 1000).toISOString(),
      contract_start_date: proposalData.contract_start_date || null,
      contract_end_date: proposalData.contract_end_date || null,
      retainer_amount: proposalData.retainerConfig?.retainerAmount || proposalData.retainer_amount || null,
      included_hours: proposalData.retainerConfig?.includedHours || proposalData.included_hours || null,
      hourly_rate_extra: proposalData.retainerConfig?.extraHourlyRate || proposalData.hourly_rate_extra || null,
      billing_day: proposalData.retainerConfig?.billingDay || proposalData.billing_day || 1,
      notes: proposalData.notes || null
    }

    logger.debug('📋 Datos preparados para inserción', {
      operationId,
      proposalData: {
        title: proposalInsert.title,
        totalAmount: proposalInsert.total_amount,
        isRecurring: proposalInsert.is_recurring,
        contactId: proposalInsert.contact_id
      }
    })

    // Fase 6: Inserción de propuesta
    logger.info('💾 Fase 6: Insertando propuesta en base de datos', { operationId })
    
    const { data: proposal, error: proposalError } = await supabase
      .from('proposals')
      .insert(proposalInsert)
      .select()
      .single()

    if (proposalError) {
      logger.error('❌ Error al insertar propuesta', {
        operationId,
        error: proposalError.message,
        code: proposalError.code,
        details: proposalError.details
      })
      
      if (proposalError.code === '23505') {
        throw createError('Propuesta duplicada', {
          severity: 'medium',
          userMessage: 'Ya existe una propuesta similar',
          technicalMessage: proposalError.message
        })
      } else if (proposalError.code === '23503') {
        throw createError('Error de referencia', {
          severity: 'medium', 
          userMessage: 'Error en las referencias de datos',
          technicalMessage: proposalError.message
        })
      } else {
        throw proposalError
      }
    }

    logger.info('✅ Propuesta insertada exitosamente', {
      operationId,
      proposalId: proposal.id,
      proposalNumber: proposal.proposal_number
    })

    // Fase 7: Inserción de líneas de servicio
    if (services.length > 0) {
      logger.info('📦 Fase 7: Insertando líneas de servicio', {
        operationId,
        proposalId: proposal.id,
        lineItemCount: services.length
      })
      
      const lineItems = services.map(service => ({
        proposal_id: proposal.id,
        name: service.name,
        description: service.description || '',
        quantity: service.quantity || 1,
        unit_price: service.customPrice || service.basePrice || 0,
        total_price: service.total || service.customPrice || service.basePrice || 0,
        billing_unit: service.billingUnit || 'unit'
      }))

      const { error: lineItemsError } = await supabase
        .from('proposal_line_items')
        .insert(lineItems)

      if (lineItemsError) {
        logger.error('❌ Error al insertar líneas de servicio', {
          operationId,
          proposalId: proposal.id,
          error: lineItemsError.message,
          lineItemCount: lineItems.length
        })
        
        throw createError('Error al guardar servicios de la propuesta', {
          severity: 'high',
          userMessage: 'Error al guardar los servicios de la propuesta',
          technicalMessage: lineItemsError.message
        })
      }

      logger.info('✅ Líneas de servicio insertadas exitosamente', {
        operationId,
        proposalId: proposal.id,
        lineItemsInserted: lineItems.length
      })
    }

    logger.info('🎉 Guardado de propuesta completado exitosamente', {
      operationId,
      proposalId: proposal.id,
      totalServices: services.length,
      totalAmount,
      duration: Date.now() - parseInt(operationId.split('-')[0], 16) || 0
    })

    return proposal

  } catch (error) {
    logger.error('💥 Error crítico en guardado de propuesta', {
      operationId,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      proposalTitle: proposalData?.title,
      serviceCount: proposalData?.selectedServices?.length || proposalData?.line_items?.length || 0
    })

    handleError(error, 'ProposalService')
    throw error
  }
}
