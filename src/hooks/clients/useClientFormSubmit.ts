
import { useSharedFormSubmit } from '../shared/useSharedFormSubmit'
import { mapBaseFormDataToEntity } from '@/types/shared/baseFormTypes'
import { createLogger } from '@/utils/logger'
import type { ClientFormData } from '@/components/clients/ClientFormTabs'
import type { Client } from './clientFormTypes'

/**
 * Mapea los datos del formulario de cliente al formato de entidad
 * @param {ClientFormData} data - Datos del formulario
 * @param {string} orgId - ID de la organización
 * @returns {Object} Entidad de cliente formateada
 */
const mapClientFormDataToEntity = (data: ClientFormData, orgId: string) => {
  const logger = createLogger('mapClientFormDataToEntity')
  
  try {
    const entity = {
      ...mapBaseFormDataToEntity(data, orgId),
      relationship_type: 'cliente' as const,
    }

    logger.debug('Cliente mapeado exitosamente', {
      orgId,
      clientType: data.client_type,
      relationshipType: 'cliente'
    })

    return entity
  } catch (error) {
    logger.error('Error al mapear datos de cliente', { error, data, orgId })
    throw error
  }
}

/**
 * Hook para gestionar el envío del formulario de clientes
 * Proporciona funciones para crear y actualizar clientes con validación
 * 
 * @param {Client | null} client - Cliente existente (null para crear nuevo)
 * @param {() => void} onClose - Función a ejecutar al cerrar el formulario
 * @returns {Object} Funciones y estado del envío del formulario
 * 
 * @example
 * ```typescript
 * const { submitForm, isSubmitting, error } = useClientFormSubmit(client, onClose)
 * 
 * // Enviar formulario
 * await submitForm(formData)
 * ```
 * 
 * @since 1.0.0
 */
export const useClientFormSubmit = (client: Client | null, onClose: () => void) => {
  const logger = createLogger('useClientFormSubmit')

  try {
    if (typeof onClose !== 'function') {
      throw new Error('onClose debe ser una función válida')
    }

    logger.debug('Inicializando envío de formulario de cliente', {
      clientId: client?.id,
      mode: client ? 'update' : 'create'
    })

    return useSharedFormSubmit({
      entity: client,
      onClose,
      tableName: 'contacts',
      mapFormDataToEntity: mapClientFormDataToEntity,
      successMessage: {
        create: 'Cliente creado exitosamente',
        update: 'Cliente actualizado exitosamente'
      }
    })
  } catch (error) {
    logger.error('Error al inicializar envío de formulario', { error, client })
    throw error
  }
}
