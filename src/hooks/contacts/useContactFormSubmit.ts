
import { useSharedFormSubmit } from '../shared/useSharedFormSubmit'
import { mapBaseFormDataToEntity } from '@/types/shared/baseFormTypes'
import { createLogger } from '@/utils/logger'
import type { ContactFormData } from '@/components/contacts/ContactFormTabs'
import type { Contact } from './contactFormTypes'

const logger = createLogger('useContactFormSubmit')

/**
 * Mapea los datos del formulario de contacto al formato de entidad
 * Incluye lógica específica para contactos como last_contact_date automático
 * 
 * @param {ContactFormData} data - Datos del formulario de contacto
 * @param {string} orgId - ID de la organización
 * @returns {Object} Entidad de contacto formateada para Supabase
 * 
 * @throws {Error} Si los datos del formulario son inválidos
 * @throws {Error} Si orgId no es válido
 * @throws {Error} Si relationship_type no es válido
 * 
 * @example
 * ```typescript
 * const entityData = mapContactFormDataToEntity(formData, 'org-123')
 * // Resultado: { ...baseData, relationship_type: 'prospecto', last_contact_date: '2023-...' }
 * ```
 */
const mapContactFormDataToEntity = (data: ContactFormData, orgId: string) => {
  const functionLogger = createLogger('mapContactFormDataToEntity')
  const startTime = performance.now()
  
  try {
    // Validación robusta de parámetros
    if (!data || typeof data !== 'object') {
      throw new Error('Los datos del formulario son requeridos y deben ser un objeto válido')
    }
    
    if (!orgId?.trim()) {
      throw new Error('orgId es requerido y no puede estar vacío')
    }

    // Validación de campos requeridos específicos para contactos
    if (!data.name?.trim()) {
      throw new Error('El nombre del contacto es requerido')
    }

    // Validación de relationship_type
    const validRelationshipTypes = ['prospecto', 'cliente', 'ex_cliente']
    if (data.relationship_type && !validRelationshipTypes.includes(data.relationship_type)) {
      throw new Error(`relationship_type debe ser uno de: ${validRelationshipTypes.join(', ')}`)
    }

    functionLogger.debug('Iniciando mapeo de datos de contacto', {
      orgId,
      relationshipType: data.relationship_type,
      contactType: data.client_type,
      hasName: !!data.name,
      hasEmail: !!data.email,
      hasPhone: !!data.phone
    })

    // Aplicar mapeo base y agregar configuración específica de contacto
    const baseEntity = mapBaseFormDataToEntity(data, orgId)
    
    const entity = {
      ...baseEntity,
      relationship_type: data.relationship_type || 'prospecto', // Default a prospecto si no se especifica
      last_contact_date: new Date().toISOString(), // Actualizar fecha de último contacto
    }

    const duration = performance.now() - startTime
    functionLogger.debug('Contacto mapeado exitosamente', {
      orgId,
      relationshipType: entity.relationship_type,
      clientType: data.client_type,
      hasCompanyId: !!data.company_id,
      lastContactDate: entity.last_contact_date,
      duration
    })

    // Métricas de rendimiento
    if (duration > 10) {
      functionLogger.warn('Mapeo de contacto tomó tiempo considerable', {
        duration,
        dataSize: JSON.stringify(data).length
      })
    }

    return entity
  } catch (error) {
    const duration = performance.now() - startTime
    functionLogger.error('Error al mapear datos de contacto', { 
      error: error instanceof Error ? error.message : 'Error desconocido',
      data: data ? Object.keys(data) : 'undefined',
      orgId,
      duration
    })
    throw error
  }
}

/**
 * Hook para gestionar el envío del formulario de contactos
 * Proporciona funciones especializadas para crear y actualizar contactos con validación
 * Incluye manejo automático de fecha de último contacto y validación de tipos de relación
 * 
 * @param {Contact | null} contact - Contacto existente (null para crear nuevo)
 * @param {() => void} onClose - Función a ejecutar al cerrar el formulario
 * @returns {Object} Funciones y estado del envío del formulario
 * 
 * @throws {Error} Si onClose no es una función válida
 * @throws {Error} Si el contacto proporcionado tiene formato inválido
 * 
 * @example
 * ```typescript
 * const { submitForm, isSubmitting, error, clearError } = useContactFormSubmit(contact, onClose)
 * 
 * // Enviar formulario
 * const result = await submitForm(formData)
 * if (result.success) {
 *   console.log('Contacto guardado:', result.data)
 *   console.log('Operación:', result.operation) // 'create' | 'update'
 *   console.log('Duración:', result.duration, 'ms')
 * }
 * 
 * // Limpiar errores manualmente si es necesario
 * if (error) clearError()
 * ```
 * 
 * @since 1.0.0
 */
export const useContactFormSubmit = (contact: Contact | null, onClose: () => void) => {
  const hookLogger = createLogger('useContactFormSubmit')

  try {
    // Validación robusta de parámetros
    if (typeof onClose !== 'function') {
      const error = new Error('onClose debe ser una función válida')
      hookLogger.error('Parámetro onClose inválido', { 
        onCloseType: typeof onClose,
        contactId: contact?.id 
      })
      throw error
    }

    // Validación opcional del contacto existente
    if (contact !== null && (!contact || typeof contact !== 'object' || !contact.id)) {
      const error = new Error('Contacto debe ser null o un objeto válido con ID')
      hookLogger.error('Parámetro contact inválido', { 
        contact,
        hasId: !!(contact as any)?.id,
        contactType: typeof contact
      })
      throw error
    }

    hookLogger.debug('Inicializando envío de formulario de contacto', {
      contactId: contact?.id,
      mode: contact ? 'update' : 'create',
      contactName: contact?.name,
      relationshipType: contact?.relationship_type,
      clientType: contact?.client_type
    })

    // Configurar hook compartido con parámetros específicos para contactos
    const sharedFormResult = useSharedFormSubmit({
      entity: contact,
      onClose,
      tableName: 'contacts',
      mapFormDataToEntity: mapContactFormDataToEntity,
      successMessage: {
        create: 'Contacto creado exitosamente',
        update: 'Contacto actualizado exitosamente'
      },
      retryStrategy: {
        maxRetries: 2, // Reintentos estándar para contactos
        delay: 1000    // Delay estándar
      }
    })

    hookLogger.debug('Hook de contacto inicializado correctamente', {
      contactId: contact?.id,
      isSubmitting: sharedFormResult.isSubmitting,
      hasError: !!sharedFormResult.error
    })

    return sharedFormResult
  } catch (error) {
    hookLogger.error('Error al inicializar envío de formulario de contacto', { 
      error: error instanceof Error ? error.message : 'Error desconocido',
      contact: contact ? { 
        id: contact.id, 
        name: contact.name, 
        relationship_type: contact.relationship_type 
      } : null,
      onCloseProvided: typeof onClose === 'function'
    })
    throw error
  }
}
