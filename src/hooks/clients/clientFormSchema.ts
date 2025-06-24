
import { z } from 'zod'

export const clientSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  email: z.string().email('Email inválido').or(z.literal('')),
  phone: z.string().optional(),
  dni_nif: z.string().optional(),
  address_street: z.string().optional(),
  address_city: z.string().optional(),
  address_postal_code: z.string().optional(),
  address_country: z.string().optional(),
  legal_representative: z.string().optional(),
  client_type: z.enum(['particular', 'empresa', 'autonomo']),
  business_sector: z.string().optional(),
  how_found_us: z.string().optional(),
  contact_preference: z.enum(['email', 'telefono', 'whatsapp', 'presencial']),
  preferred_language: z.enum(['es', 'ca', 'en']),
  hourly_rate: z.string().optional(),
  payment_method: z.enum(['transferencia', 'domiciliacion', 'efectivo', 'tarjeta']),
  status: z.enum(['activo', 'inactivo', 'prospecto', 'bloqueado']),
  tags: z.array(z.string()).optional(),
  internal_notes: z.string().optional(),
})
