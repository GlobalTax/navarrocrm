/**
 * Validación de datos de Quantum Economics usando Zod
 */

import { z } from 'zod'

// Esquema para validar datos de customer de Quantum
export const QuantumCustomerSchema = z.object({
  regid: z.string().min(1, 'RegID requerido'),
  customerId: z.string().min(1, 'Customer ID requerido'),
  name: z.string().min(1, 'Nombre requerido').max(255, 'Nombre demasiado largo'),
  nif: z.string().optional(),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  phone: z.string().optional(),
  countryISO: z.string().optional(),
  streetType: z.string().optional(),
  streetName: z.string().optional(),
  streetNumber: z.string().optional(),
  staircase: z.string().optional(),
  floor: z.string().optional(),
  room: z.string().optional(),
  postCode: z.string().optional(),
  cityCode: z.string().optional(),
  iban: z.string().optional(),
  swift: z.string().optional(),
  paymentMethod: z.string().optional(),
  family: z.number().optional(),
  mandateReference: z.string().optional(),
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
 * Valida un customer de Quantum
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