/**
 * Validación de datos de Quantum Economics usando Zod
 * Con coerción de tipos para campos que llegan como número desde la API
 */

import { z } from 'zod'

// Helper: acepta string o number, siempre devuelve string
const coerceToString = z.preprocess(
  (val) => (val == null ? '' : String(val)),
  z.string()
)

// Helper: acepta string o number, devuelve string con min(1)
const coerceToStringRequired = z.preprocess(
  (val) => (val == null ? '' : String(val)),
  z.string().min(1)
)

// Esquema para validar datos de customer de Quantum
export const QuantumCustomerSchema = z.object({
  regid: coerceToStringRequired,
  customerId: coerceToStringRequired,
  name: z.string().min(1, 'Nombre requerido').max(255, 'Nombre demasiado largo'),
  nif: z.string().optional(),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  phone: coerceToString.optional(),
  countryISO: z.string().optional(),
  streetType: z.string().optional(),
  streetName: z.string().optional(),
  streetNumber: coerceToString.optional(),
  staircase: coerceToString.optional(),
  floor: coerceToString.optional(),
  room: coerceToString.optional(),
  postCode: coerceToString.optional(),
  cityCode: coerceToString.optional(),
  iban: z.string().optional(),
  swift: z.string().optional(),
  paymentMethod: z.string().optional(),
  family: z.number().optional(),
  mandateReference: coerceToString.optional(),
  mandateDate: z.string().optional()
})

// Esquema para contacto que se va a insertar en la base de datos
export const ContactInsertSchema = z.object({
  org_id: z.string().uuid('org_id debe ser un UUID válido'),
  name: z.string().min(1, 'Nombre requerido').max(255, 'Nombre demasiado largo'),
  email: z.string().email('Email inválido').optional().nullable(),
  phone: z.string().optional().nullable(),
  dni_nif: z.string().optional().nullable(),
  address_street: z.string().optional().nullable(),
  address_city: z.string().optional().nullable(),
  address_postal_code: z.string().optional().nullable(),
  address_country: z.string().optional().nullable(),
  client_type: z.enum(['particular', 'empresa']),
  relationship_type: z.enum(['prospecto', 'cliente', 'ex_cliente']),
  status: z.enum(['activo', 'inactivo', 'bloqueado']),
  source: z.string().optional().default('quantum_import'),
  quantum_customer_id: z.string().optional().nullable(),
  internal_notes: z.string().optional().nullable(),
  tags: z.array(z.string()).optional().default([])
})

// Esquema para respuesta de la API de Quantum
export const QuantumApiResponseSchema = z.object({
  error: z.object({
    message: z.string(),
    errorCode: z.string()
  }).optional(),
  apiVersion: z.string().optional(),
  customers: z.array(QuantumCustomerSchema).optional()
})

/**
 * Valida un customer de Quantum (con coerción de tipos)
 */
export const validateQuantumCustomer = (customer: unknown) => {
  return QuantumCustomerSchema.safeParse(customer)
}

/**
 * Valida múltiples customers de Quantum
 */
export const validateQuantumCustomers = (customers: unknown[]) => {
  const results = customers.map(customer => validateQuantumCustomer(customer))
  
  const valid = results.filter(r => r.success).map(r => r.data)
  const invalid = results.filter(r => !r.success).map((r, index) => ({
    index,
    errors: r.error?.issues || []
  }))
  
  return {
    valid,
    invalid,
    totalValid: valid.length,
    totalInvalid: invalid.length
  }
}

/**
 * Valida datos de contacto antes de insertar
 */
export const validateContactForInsert = (contact: unknown) => {
  return ContactInsertSchema.safeParse(contact)
}

/**
 * Valida respuesta de la API de Quantum
 */
export const validateQuantumApiResponse = (response: unknown) => {
  return QuantumApiResponseSchema.safeParse(response)
}

// Tipos TypeScript derivados de los esquemas
export type QuantumCustomer = z.infer<typeof QuantumCustomerSchema>
export type ContactInsert = z.infer<typeof ContactInsertSchema>
export type QuantumApiResponse = z.infer<typeof QuantumApiResponseSchema>
