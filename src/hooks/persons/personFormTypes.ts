
import { z } from 'zod'
import { baseFormSchema } from '@/types/shared/baseFormSchema'

export const personSchema = baseFormSchema.extend({
  client_type: z.enum(['particular', 'autonomo']),
  relationship_type: z.enum(['prospecto', 'cliente', 'ex_cliente']),
  company_id: z.string().optional(),
})

export interface PersonFormData {
  name: string
  email: string
  phone: string
  dni_nif: string
  address_street: string
  address_city: string
  address_postal_code: string
  address_country: string
  legal_representative: string
  client_type: 'particular' | 'autonomo'
  business_sector: string
  how_found_us: string
  contact_preference: 'email' | 'telefono' | 'whatsapp' | 'presencial'
  preferred_language: 'es' | 'ca' | 'en'
  hourly_rate: string
  payment_method: 'transferencia' | 'domiciliacion' | 'efectivo' | 'tarjeta'
  status: 'activo' | 'inactivo' | 'prospecto' | 'bloqueado'
  relationship_type: 'prospecto' | 'cliente' | 'ex_cliente'
  tags: string[]
  internal_notes: string
  company_id?: string
}

export const defaultPersonFormValues: PersonFormData = {
  name: '',
  email: '',
  phone: '',
  dni_nif: '',
  address_street: '',
  address_city: '',
  address_postal_code: '',
  address_country: 'España',
  legal_representative: '',
  client_type: 'particular',
  business_sector: '',
  how_found_us: '',
  contact_preference: 'email',
  preferred_language: 'es',
  hourly_rate: '',
  payment_method: 'transferencia',
  status: 'activo',
  relationship_type: 'prospecto',
  tags: [],
  internal_notes: '',
  company_id: ''
}
