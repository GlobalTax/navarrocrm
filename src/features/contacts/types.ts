/**
 * Tipos para el módulo de contactos
 */
export type {
  Contact,
  Client
} from '@/types/shared/clientTypes'

// Tipos adicionales que pueden no existir aún
export type ContactType = 'individual' | 'company'
export type ContactStatus = 'active' | 'inactive' | 'prospect' | 'blocked'
export interface ContactFilters {
  search?: string
  type?: ContactType
  status?: ContactStatus
}
export interface CreateContactData {
  name: string
  email?: string
  phone?: string
  client_type?: ContactType
}
export interface UpdateContactData extends Partial<CreateContactData> {
  id: string
}