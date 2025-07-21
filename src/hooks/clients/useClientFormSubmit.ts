
import { useSharedFormSubmit } from '../shared/useSharedFormSubmit'
import { mapBaseFormDataToEntity } from '@/types/shared/baseFormTypes'
import { createLogger } from '@/utils/logger'
import type { ClientFormData } from '@/components/clients/ClientFormTabs'
import type { Client } from './clientFormTypes'

const logger = createLogger('useClientFormSubmit')

/**
 * Mapea los datos del formulario de cliente al formato de entidad
 * Aplica transformaciones específicas para clientes, incluyendo relationship_type fijo
 * 
 * @param {ClientFormData} data - Datos del formulario de cliente
 * @param {string} orgId - ID de la organización
 * @returns {Object} Entidad de cliente formateada para Supabase
 * 
 * @throws {Error} Si los datos del formulario son inválidos
 * @throws {Error} Si orgId no es válido
 * 
 * @example
 * ```typescript
 * const entityData = mapClientFormDataToEntity(formData, 'org-123')
 * // Resultado: { ...baseData, relationship_type: 'cliente' }
 * ```
 */
const mapClientFormDataToEntity = (data: ClientFormData, orgId: string) => {
  const functionLogger = createLogger('mapClientFormDataToEntity')
  const startTime = performance.now()
  
  try {
    // Validación robusta de parámetros
    if (!data || typeof data !== 'object') {
      throw new Error('Los datos del formulario son requeridos y deben ser un objeto válido')
    }
    
    if (!orgId?.trim()) {
      throw new Error('orgId es requerido y no puede estar vacío')
    }

    // Validación de campos requeridos específicos para clientes
    if (!data.name?.trim()) {
      throw new Error('El nombre del cliente es requerido')
    }

    functionLogger.debug('Iniciando mapeo de datos de cliente', {
      orgId,
      clientType: data.client_type,
      hasName: !!data.name,
      hasEmail: !!data.email,
      hasPhone: !!data.phone
    })

    // Aplicar mapeo base y agregar configuración específica de cliente
    const baseEntity = mapBaseFormDataToEntity(data, orgId)
    
    const entity = {
      ...baseEntity,
      relationship_type: 'cliente' as const, // Forzar tipo de relación para clientes
    }

    const duration = performance.now() - startTime
    functionLogger.debug('Cliente mapeado exitosamente', {
      orgId,
      clientType: data.client_type,
      relationshipType: entity.relationship_type,
      hasCompanyId: !!data.company_id,
      duration
    })

    // Métricas de rendimiento
    if (duration > 10) {
      functionLogger.warn('Mapeo de cliente tomó tiempo considerable', {
        duration,
        dataSize: JSON.stringify(data).length
      })
    }

    return entity
  } catch (error) {
    const duration = performance.now() - startTime
    functionLogger.error('Error al mapear datos de cliente', { 
      error: error instanceof Error ? error.message : 'Error desconocido',
      data: data ? Object.keys(data) : 'undefined',
      orgId,
      duration
    })
    throw error
  }
}

/**
 * Hook para gestionar el envío del formulario de clientes
 * Proporciona funciones especializadas para crear y actualizar clientes con validación robusta
 * 
 * @param {Client | null} client - Cliente existente (null para crear nuevo)
 * @param {() => void} onClose - Función a ejecutar al cerrar el formulario
 * @returns {Object} Funciones y estado del envío del formulario
 * 
 * @throws {Error} Si onClose no es una función válida
 * @throws {Error} Si el cliente proporcionado tiene formato inválido
 * 
 * @example
 * ```typescript
 * const { submitForm, isSubmitting, error, clearError } = useClientFormSubmit(client, onClose)
 * 
 * // Enviar formulario
 * const result = await submitForm(formData)
 * if (result.success) {
 *   console.log('Cliente guardado:', result.data)
 * }
 * 
 * // Limpiar errores
 * clearError()
 * ```
 * 
 * @since 1.0.0
 */
export const useClientFormSubmit = (client: Client | null, onClose: () => void) => {
  const hookLogger = createLogger('useClientFormSubmit')

  try {
    // Validación robusta de parámetros
    if (typeof onClose !== 'function') {
      const error = new Error('onClose debe ser una función válida')
      hookLogger.error('Parámetro onClose inválido', { 
        onCloseType: typeof onClose,
        clientId: client?.id 
      })
      throw error
    }

    // Validación opcional del cliente existente
    if (client !== null && (!client || typeof client !== 'object' || !client.id)) {
      const error = new Error('Cliente debe ser null o un objeto válido con ID')
      hookLogger.error('Parámetro client inválido', { 
        client,
        hasId: !!(client as any)?.id,
        clientType: typeof client
      })
      throw error
    }

    hookLogger.debug('Inicializando envío de formulario de cliente', {
      clientId: client?.id,
      mode: client ? 'update' : 'create',
      clientName: client?.name,
      clientType: client?.client_type
    })

    // Configurar hook compartido con parámetros específicos para clientes
    const sharedFormResult = useSharedFormSubmit({
      entity: client,
      onClose,
      tableName: 'contacts', // Los clientes se almacenan en la tabla contacts
      mapFormDataToEntity: mapClientFormDataToEntity,
      successMessage: {
        create: 'Cliente creado exitosamente',
        update: 'Cliente actualizado exitosamente'
      },
      retryStrategy: {
        maxRetries: 3, // Más reintentos para clientes (datos críticos)
        delay: 1500    // Mayor delay para operaciones de cliente
      }
    })

    hookLogger.debug('Hook de cliente inicializado correctamente', {
      clientId: client?.id,
      isSubmitting: sharedFormResult.isSubmitting,
      hasError: !!sharedFormResult.error
    })

    return sharedFormResult
  } catch (error) {
    hookLogger.error('Error al inicializar envío de formulario de cliente', { 
      error: error instanceof Error ? error.message : 'Error desconocido',
      client: client ? { id: client.id, name: client.name } : null,
      onCloseProvided: typeof onClose === 'function'
    })
    throw error
  }
}
