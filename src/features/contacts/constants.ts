/**
 * Contact Feature Constants
 * 
 * Constantes para el módulo de contactos
 */

import { ContactType, ContactStatus, ContactPreference, PaymentMethod, Language, RelationshipType } from './types'

export const CONTACT_TYPES: { value: ContactType; label: string }[] = [
  { value: 'particular', label: 'Persona Física' },
  { value: 'empresa', label: 'Empresa' },
  { value: 'autonomo', label: 'Autónomo' }
]

export const CONTACT_STATUS: { value: ContactStatus; label: string }[] = [
  { value: 'activo', label: 'Activo' },
  { value: 'inactivo', label: 'Inactivo' },
  { value: 'prospecto', label: 'Prospecto' },
  { value: 'bloqueado', label: 'Bloqueado' }
]

export const CONTACT_PREFERENCES: { value: ContactPreference; label: string }[] = [
  { value: 'email', label: 'Email' },
  { value: 'telefono', label: 'Teléfono' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'presencial', label: 'Presencial' }
]

export const PAYMENT_METHODS: { value: PaymentMethod; label: string }[] = [
  { value: 'transferencia', label: 'Transferencia' },
  { value: 'domiciliacion', label: 'Domiciliación' },
  { value: 'efectivo', label: 'Efectivo' },
  { value: 'tarjeta', label: 'Tarjeta' }
]

export const LANGUAGES: { value: Language; label: string }[] = [
  { value: 'es', label: 'Español' },
  { value: 'ca', label: 'Catalán' },
  { value: 'en', label: 'Inglés' }
]

export const RELATIONSHIP_TYPES: { value: RelationshipType; label: string }[] = [
  { value: 'prospecto', label: 'Prospecto' },
  { value: 'cliente', label: 'Cliente' },
  { value: 'ex_cliente', label: 'Ex-Cliente' }
]

export const DEFAULT_CONTACT_VALUES = {
  name: '',
  email: '',
  phone: '',
  dni_nif: '',
  address_street: '',
  address_city: '',
  address_postal_code: '',
  address_country: 'España',
  legal_representative: '',
  client_type: 'particular' as ContactType,
  business_sector: '',
  how_found_us: '',
  contact_preference: 'email' as ContactPreference,
  preferred_language: 'es' as Language,
  hourly_rate: '',
  payment_method: 'transferencia' as PaymentMethod,
  status: 'activo' as ContactStatus,
  relationship_type: 'prospecto' as RelationshipType,
  tags: [] as string[],
  internal_notes: '',
  company_id: ''
}

export const DEFAULT_EMAIL_PREFERENCES = {
  receive_followups: true,
  receive_reminders: true,
  receive_invitations: true
}

export const MEETING_TIMES = [
  { value: 'morning', label: 'Mañana (9:00 - 12:00)' },
  { value: 'afternoon', label: 'Tarde (13:00 - 17:00)' },
  { value: 'evening', label: 'Tarde/Noche (17:00 - 20:00)' },
  { value: 'flexible', label: 'Flexible' }
]

export const COMMON_BUSINESS_SECTORS = [
  'Tecnología',
  'Construcción',
  'Consultoría',
  'Comercio',
  'Salud',
  'Educación',
  'Turismo',
  'Alimentación',
  'Transporte',
  'Inmobiliario',
  'Servicios Financieros',
  'Manufactura',
  'Agricultura',
  'Entretenimiento',
  'Energía',
  'Otro'
]

export const HOW_FOUND_US_OPTIONS = [
  'Recomendación',
  'Google',
  'LinkedIn',
  'Web',
  'Evento',
  'Prensa',
  'Cliente existente',
  'Otro'
]

// Configuración para paginación
export const CONTACTS_PAGE_SIZE = 50
export const CONTACTS_SEARCH_MIN_LENGTH = 2

// Configuración para validaciones
export const CONTACT_VALIDATION = {
  name: {
    minLength: 2,
    maxLength: 100
  },
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  },
  phone: {
    minLength: 9,
    maxLength: 15
  },
  dni_nif: {
    patterns: {
      dni: /^[0-9]{8}[A-Z]$/,
      cif: /^[ABCDEFGHJNPQRSUVW][0-9]{7}[0-9A-J]$/,
      nie: /^[XYZ][0-9]{7}[A-Z]$/
    }
  }
}