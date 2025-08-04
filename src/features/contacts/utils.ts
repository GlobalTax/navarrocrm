/**
 * Contact Utilities
 * 
 * Utilidades específicas para el módulo de contactos
 */

import { Contact, Person, Company, ContactFormData, ContactType } from './types'
import { CONTACT_VALIDATION, DEFAULT_EMAIL_PREFERENCES } from './constants'

/**
 * Validar NIF/CIF/NIE español
 */
export const validateNifCif = (value: string): boolean => {
  if (!value) return false
  
  const cleanValue = value.replace(/[\s-]/g, '').toUpperCase()
  const { dni, cif, nie } = CONTACT_VALIDATION.dni_nif.patterns
  
  return dni.test(cleanValue) || cif.test(cleanValue) || nie.test(cleanValue)
}

/**
 * Formatear NIF/CIF/NIE automáticamente
 */
export const formatNifCif = (value: string): string => {
  const cleaned = value.replace(/[\s-]/g, '').toUpperCase()
  if (cleaned.length <= 9) {
    return cleaned
  }
  return cleaned.substring(0, 9)
}

/**
 * Obtener mensaje de validación para NIF/CIF/NIE
 */
export const getNifValidationMessage = (value: string): string | null => {
  if (!value) return null
  if (!validateNifCif(value)) {
    return 'Formato no válido. Ejemplos: B12345678, 12345678Z, X1234567L'
  }
  return null
}

/**
 * Validar email
 */
export const validateEmail = (email: string): boolean => {
  if (!email) return false
  return CONTACT_VALIDATION.email.pattern.test(email)
}

/**
 * Validar teléfono (formato español)
 */
export const validatePhone = (phone: string): boolean => {
  if (!phone) return false
  const cleanPhone = phone.replace(/[\s-]/g, '')
  return cleanPhone.length >= CONTACT_VALIDATION.phone.minLength && 
         cleanPhone.length <= CONTACT_VALIDATION.phone.maxLength &&
         /^\+?[0-9]+$/.test(cleanPhone)
}

/**
 * Formatear teléfono automáticamente
 */
export const formatPhone = (phone: string): string => {
  const cleaned = phone.replace(/[^\d+]/g, '')
  return cleaned
}

/**
 * Parsear preferencias de email de forma segura
 */
export const parseEmailPreferences = (preferences: any) => {
  if (!preferences) return DEFAULT_EMAIL_PREFERENCES
  
  if (typeof preferences === 'string') {
    try {
      return JSON.parse(preferences)
    } catch {
      return DEFAULT_EMAIL_PREFERENCES
    }
  }
  
  return { ...DEFAULT_EMAIL_PREFERENCES, ...preferences }
}

/**
 * Generar nombre completo para mostrar
 */
export const getContactDisplayName = (contact: Contact): string => {
  if (!contact.name) return 'Sin nombre'
  
  if (contact.client_type === 'empresa') {
    return contact.name
  }
  
  return contact.name
}

/**
 * Obtener información de contacto principal
 */
export const getContactInfo = (contact: Contact): string => {
  const parts: string[] = []
  
  if (contact.email) parts.push(contact.email)
  if (contact.phone) parts.push(contact.phone)
  
  return parts.join(' • ') || 'Sin información de contacto'
}

/**
 * Obtener color del estado
 */
export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'activo':
      return 'text-success-600 bg-success-50'
    case 'cliente':
      return 'text-primary-600 bg-primary-50'
    case 'prospecto':
      return 'text-warning-600 bg-warning-50'
    case 'inactivo':
      return 'text-gray-600 bg-gray-50'
    case 'bloqueado':
      return 'text-destructive-600 bg-destructive-50'
    default:
      return 'text-gray-600 bg-gray-50'
  }
}

/**
 * Obtener color del tipo de relación
 */
export const getRelationshipColor = (relationship: string): string => {
  switch (relationship) {
    case 'cliente':
      return 'text-success-600 bg-success-50'
    case 'prospecto':
      return 'text-warning-600 bg-warning-50'
    case 'ex_cliente':
      return 'text-gray-600 bg-gray-50'
    default:
      return 'text-gray-600 bg-gray-50'
  }
}

/**
 * Obtener icono del tipo de cliente
 */
export const getClientTypeIcon = (clientType: ContactType): string => {
  switch (clientType) {
    case 'particular':
      return '👤'
    case 'empresa':
      return '🏢'
    case 'autonomo':
      return '💼'
    default:
      return '❓'
  }
}

/**
 * Convertir ContactFormData a Contact partial
 */
export const formDataToContact = (data: ContactFormData, orgId: string): Partial<Contact> => {
  return {
    name: data.name,
    email: data.email || null,
    phone: data.phone || null,
    dni_nif: data.dni_nif || null,
    address_street: data.address_street || null,
    address_city: data.address_city || null,
    address_postal_code: data.address_postal_code || null,
    address_country: data.address_country || null,
    legal_representative: data.legal_representative || null,
    client_type: data.client_type,
    business_sector: data.business_sector || null,
    how_found_us: data.how_found_us || null,
    contact_preference: data.contact_preference,
    preferred_language: data.preferred_language,
    hourly_rate: data.hourly_rate ? parseFloat(data.hourly_rate) : null,
    payment_method: data.payment_method,
    status: data.status,
    relationship_type: data.relationship_type,
    tags: data.tags || [],
    internal_notes: data.internal_notes || null,
    company_id: data.company_id || null,
    email_preferences: DEFAULT_EMAIL_PREFERENCES,
    last_contact_date: new Date().toISOString(),
    org_id: orgId
  }
}

/**
 * Convertir Contact a ContactFormData
 */
export const contactToFormData = (contact: Contact): ContactFormData => {
  return {
    name: contact.name || '',
    email: contact.email || '',
    phone: contact.phone || '',
    dni_nif: contact.dni_nif || '',
    address_street: contact.address_street || '',
    address_city: contact.address_city || '',
    address_postal_code: contact.address_postal_code || '',
    address_country: contact.address_country || 'España',
    legal_representative: contact.legal_representative || '',
    client_type: contact.client_type || 'particular',
    business_sector: contact.business_sector || '',
    how_found_us: contact.how_found_us || '',
    contact_preference: contact.contact_preference || 'email',
    preferred_language: contact.preferred_language || 'es',
    hourly_rate: contact.hourly_rate?.toString() || '',
    payment_method: contact.payment_method || 'transferencia',
    status: contact.status || 'activo',
    relationship_type: contact.relationship_type,
    tags: contact.tags || [],
    internal_notes: contact.internal_notes || '',
    company_id: contact.company_id || ''
  }
}

/**
 * Verificar si un contacto es duplicado
 */
export const isDuplicate = (contact1: Contact, contact2: Contact): boolean => {
  // Mismo quantum_customer_id
  if (contact1.quantum_customer_id && contact2.quantum_customer_id) {
    return contact1.quantum_customer_id === contact2.quantum_customer_id
  }
  
  // Mismo email
  if (contact1.email && contact2.email) {
    return contact1.email.toLowerCase() === contact2.email.toLowerCase()
  }
  
  // Mismo DNI/CIF
  if (contact1.dni_nif && contact2.dni_nif) {
    return contact1.dni_nif === contact2.dni_nif
  }
  
  return false
}

/**
 * Filtrar duplicados manteniendo el más reciente
 */
export const removeDuplicates = (contacts: Contact[]): Contact[] => {
  const unique: Contact[] = []
  
  for (const contact of contacts) {
    const duplicateIndex = unique.findIndex(existing => isDuplicate(existing, contact))
    
    if (duplicateIndex === -1) {
      unique.push(contact)
    } else {
      // Mantener el más reciente
      if (new Date(contact.created_at) > new Date(unique[duplicateIndex].created_at)) {
        unique[duplicateIndex] = contact
      }
    }
  }
  
  return unique
}

/**
 * Buscar contactos por criterios múltiples
 */
export const searchContacts = (contacts: Contact[], searchTerm: string): Contact[] => {
  if (!searchTerm) return contacts
  
  const term = searchTerm.toLowerCase()
  
  return contacts.filter(contact => 
    contact.name?.toLowerCase().includes(term) ||
    contact.email?.toLowerCase().includes(term) ||
    contact.phone?.includes(term) ||
    contact.dni_nif?.includes(term) ||
    contact.business_sector?.toLowerCase().includes(term) ||
    contact.tags?.some(tag => tag.toLowerCase().includes(term))
  )
}

/**
 * Agrupar contactos por criterio
 */
export const groupContactsBy = (contacts: Contact[], criteria: keyof Contact) => {
  return contacts.reduce((groups: { [key: string]: Contact[] }, contact) => {
    const key = String(contact[criteria] || 'Sin definir')
    if (!groups[key]) {
      groups[key] = []
    }
    groups[key].push(contact)
    return groups
  }, {})
}