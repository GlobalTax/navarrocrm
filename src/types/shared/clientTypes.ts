
// Tipos compartidos para clarificar la relación Cliente-Contacto
export interface BaseClient {
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
  client_type: string | null
  business_sector: string | null
  how_found_us: string | null
  contact_preference: string | null
  preferred_language: string | null
  hourly_rate: number | null
  payment_method: string | null
  status: string | null
  tags: string[] | null
  internal_notes: string | null
  org_id: string
  created_at: string
  updated_at: string
  timezone: string | null
  preferred_meeting_time: string | null
  email_preferences: {
    receive_followups: boolean
    receive_reminders: boolean
    receive_invitations: boolean
  } | null
}

// Cliente es un contacto con relationship_type = 'cliente'
export interface Client extends BaseClient {
  relationship_type: 'cliente'
  last_contact_date: string | null
  company_id?: string | null
}

// Contacto puede ser prospecto, cliente o ex-cliente
export interface Contact extends BaseClient {
  relationship_type: 'prospecto' | 'cliente' | 'ex_cliente'
  last_contact_date?: string | null
  company_id?: string | null
}

// Type guards para distinguir entre tipos
export const isClient = (contact: Contact): contact is Client => {
  return contact.relationship_type === 'cliente'
}

export const isProspect = (contact: Contact): boolean => {
  return contact.relationship_type === 'prospecto'
}

export const isExClient = (contact: Contact): boolean => {
  return contact.relationship_type === 'ex_cliente'
}

// Tipos adicionales
export type ContactType = string
export type ContactStatus = string

export interface ContactFilters {
  search?: string
  relationship_type?: string
  status?: string
  client_type?: string
}

export interface CreateContactData {
  name: string
  email?: string
  phone?: string
  client_type?: string
  relationship_type?: string
}

export interface UpdateContactData extends Partial<CreateContactData> {
  id: string
}
