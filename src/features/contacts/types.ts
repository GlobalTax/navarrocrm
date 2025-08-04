/**
 * Contact Feature Types
 * 
 * Tipos para el módulo de contactos, personas y empresas
 */

export type ContactType = 'particular' | 'empresa' | 'autonomo'
export type ContactStatus = 'activo' | 'inactivo' | 'prospecto' | 'bloqueado'
export type ContactPreference = 'email' | 'telefono' | 'whatsapp' | 'presencial'
export type PaymentMethod = 'transferencia' | 'domiciliacion' | 'efectivo' | 'tarjeta'
export type Language = 'es' | 'ca' | 'en'
export type RelationshipType = 'prospecto' | 'cliente' | 'ex_cliente'

export interface EmailPreferences {
  receive_followups: boolean
  receive_reminders: boolean
  receive_invitations: boolean
}

export interface Contact {
  id: string
  name: string
  email: string | null
  phone: string | null
  dni_nif: string | null
  address_street: string | null
  address_city: string | null
  address_postal_code: string | null
  address_country: string | null
  legal_representative: string | null
  client_type: ContactType | null
  business_sector: string | null
  how_found_us: string | null
  contact_preference: ContactPreference | null
  preferred_language: Language | null
  hourly_rate: number | null
  payment_method: PaymentMethod | null
  status: ContactStatus | null
  tags: string[] | null
  internal_notes: string | null
  timezone: string | null
  preferred_meeting_time: string | null
  email_preferences: EmailPreferences | null
  relationship_type: RelationshipType
  last_contact_date: string | null
  company_id: string | null
  org_id: string
  created_at: string
  updated_at: string
  // Quantum Integration
  quantum_customer_id?: string | null
  outlook_id?: string | null
  source?: string | null
  auto_imported_at?: string | null
}

export interface Person extends Contact {
  client_type: 'particular' | 'autonomo'
  company?: {
    id: string
    name: string
  } | null
}

export interface Company extends Contact {
  client_type: 'empresa'
  primary_contact?: {
    id: string
    name: string
    email: string | null
    phone: string | null
  } | null
  total_contacts?: number
}

export interface ContactFormData {
  name: string
  email: string
  phone: string
  dni_nif: string
  address_street: string
  address_city: string
  address_postal_code: string
  address_country: string
  legal_representative: string
  client_type: ContactType
  business_sector: string
  how_found_us: string
  contact_preference: ContactPreference
  preferred_language: Language
  hourly_rate: string
  payment_method: PaymentMethod
  status: ContactStatus
  relationship_type: RelationshipType
  tags: string[]
  internal_notes: string
  company_id?: string
}

export interface ContactFilters {
  status?: ContactStatus[]
  client_type?: ContactType[]
  relationship_type?: RelationshipType[]
  tags?: string[]
  business_sector?: string
  search?: string
}

export interface ContactSearchParams {
  term: string
  filters?: ContactFilters
  limit?: number
  offset?: number
}

export interface ContactValidationData {
  name: string
  email: string
  phone: string
  client_type: ContactType
  status: ContactStatus
}

// Type guards
export const isClient = (contact: Contact): boolean => {
  return contact.relationship_type === 'cliente'
}

export const isProspect = (contact: Contact): boolean => {
  return contact.relationship_type === 'prospecto'
}

export const isExClient = (contact: Contact): boolean => {
  return contact.relationship_type === 'ex_cliente'
}

export const isPerson = (contact: Contact): contact is Person => {
  return contact.client_type === 'particular' || contact.client_type === 'autonomo'
}

export const isCompany = (contact: Contact): contact is Company => {
  return contact.client_type === 'empresa'
}