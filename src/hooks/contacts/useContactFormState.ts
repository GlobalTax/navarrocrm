
import { useSharedFormState } from '../shared/useSharedFormState'
import { contactSchema } from './contactFormSchema'
import { defaultContactFormValues, type Contact } from './contactFormTypes'
import { mapBaseEntityToFormData } from '@/types/shared/baseFormTypes'
import { useLogger } from '../useLogger'
import { createLogger } from '@/utils/logger'
import type { ContactFormData } from '@/components/contacts/ContactFormTabs'

/**
 * Mapea los datos de un contacto al formato requerido por el formulario
 * @param {Contact} contact - Datos del contacto a mapear
 * @returns {ContactFormData} Datos formateados para el formulario
 */

const mapContactToFormData = (contact: Contact): ContactFormData => {
  const logger = useLogger('mapContactToFormData')
  
  const formData = {
    ...mapBaseEntityToFormData(contact),
    relationship_type: (contact.relationship_type as ContactFormData['relationship_type']) || 'prospecto',
    company_id: contact.company_id || '',
  } as ContactFormData
  
  logger.info('Contact mapping', {
    metadata: {
      contactId: contact.id,
      contactName: contact.name,
      clientType: contact.client_type,
      originalCompanyId: contact.company_id,
      mappedCompanyId: formData.company_id,
      relationshipType: formData.relationship_type,
      shouldShowSelector: contact.client_type !== 'empresa',
      fullFormData: {
        name: formData.name,
        client_type: formData.client_type,
        company_id: formData.company_id,
        relationship_type: formData.relationship_type
      }
    }
  })
  
  return formData
}

/**
 * Hook para gestionar el estado del formulario de contactos
 * Proporciona validación, mapeo de datos y gestión de estado unificada
 * 
 * @param {Contact | null} contact - Contacto a editar (null para crear nuevo)
 * @returns {Object} Objeto con estado y funciones del formulario
 * 
 * @example
 * ```typescript
 * const { form, isEditing, resetForm } = useContactFormState(selectedContact)
 * 
 * // Usar en formulario
 * <Form {...form}>
 *   {/* campos del formulario */}
 * </Form>
 * ```
 * 
 * @since 1.0.0
 */
export const useContactFormState = (contact: Contact | null) => {
  const logger = createLogger('useContactFormState')
  
  try {
    logger.debug('Inicializando estado de formulario de contacto', {
      contactId: contact?.id,
      mode: contact ? 'edit' : 'create'
    })

    return useSharedFormState({
      schema: contactSchema,
      defaultValues: defaultContactFormValues,
      entity: contact,
      mapEntityToFormData: mapContactToFormData
    })
  } catch (error) {
    logger.error('Error al inicializar formulario de contacto', { error, contact })
    throw error
  }
}
