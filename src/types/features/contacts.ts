/**
 * Tipos para el módulo de contactos
 */

import { BaseEntity } from '../core'

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

export interface Contact extends BaseEntity {
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
  tags: string[]
  internal_notes: string
}

export interface ContactValidationData {
  name: string
  email: string
  phone: string
  client_type: ContactType
  status: ContactStatus
}

export interface ContactFilters {
  status?: ContactStatus[]
  client_type?: ContactType[]
  relationship_type?: RelationshipType[]
  tags?: string[]
  business_sector?: string
  search?: string
}