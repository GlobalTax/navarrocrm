
import { useSharedFormSubmit } from '../shared/useSharedFormSubmit'
import { mapBaseFormDataToEntity } from '@/types/shared/baseFormTypes'
import { createLogger } from '@/utils/logger'
import type { ContactFormData } from '@/components/contacts/ContactFormTabs'
import type { Contact } from './contactFormTypes'

/**
 * Mapea los datos del formulario de contacto al formato de entidad
 * @param {ContactFormData} data - Datos del formulario
 * @param {string} orgId - ID de la organización
 * @returns {Object} Entidad de contacto formateada
 */
const mapContactFormDataToEntity = (data: ContactFormData, orgId: string) => {
  const logger = createLogger('mapContactFormDataToEntity')
  
  try {
    const entity = {
      ...mapBaseFormDataToEntity(data, orgId),
      relationship_type: data.relationship_type,
      last_contact_date: new Date().toISOString(),
    }

    logger.debug('Contacto mapeado exitosamente', {
      orgId,
      relationshipType: data.relationship_type,
      clientType: data.client_type
    })

    return entity
  } catch (error) {
    logger.error('Error al mapear datos de contacto', { error, data, orgId })
    throw error
  }
}

/**
 * Hook para gestionar el envío del formulario de contactos
 * Proporciona funciones para crear y actualizar contactos con validación
 * 
 * @param {Contact | null} contact - Contacto existente (null para crear nuevo)
 * @param {() => void} onClose - Función a ejecutar al cerrar el formulario
 * @returns {Object} Funciones y estado del envío del formulario
 * 
 * @example
 * ```typescript
 * const { submitForm, isSubmitting, error } = useContactFormSubmit(contact, onClose)
 * 
 * // Enviar formulario
 * await submitForm(formData)
 * ```
 * 
 * @since 1.0.0
 */
export const useContactFormSubmit = (contact: Contact | null, onClose: () => void) => {
  const logger = createLogger('useContactFormSubmit')

  try {
    if (typeof onClose !== 'function') {
      throw new Error('onClose debe ser una función válida')
    }

    logger.debug('Inicializando envío de formulario de contacto', {
      contactId: contact?.id,
      mode: contact ? 'update' : 'create'
    })

    return useSharedFormSubmit({
      entity: contact,
      onClose,
      tableName: 'contacts',
      mapFormDataToEntity: mapContactFormDataToEntity,
      successMessage: {
        create: 'Contacto creado exitosamente',
        update: 'Contacto actualizado exitosamente'
      }
    })
  } catch (error) {
    logger.error('Error al inicializar envío de formulario', { error, contact })
    throw error
  }
}
