
import { z } from 'zod'
import { baseFormSchema } from '@/types/shared/baseFormSchema'

export const contactSchema = baseFormSchema.extend({
  relationship_type: z.enum(['prospecto', 'cliente', 'ex_cliente']),
  company_id: z.string().optional(),
  
  // Validaciones específicas para email
  email: z.string()
    .email('Email inválido')
    .max(100, 'El email no puede superar los 100 caracteres')
    .or(z.literal('')),
  
  // Validaciones para DNI/NIF/CIF
  dni_nif: z.string()
    .regex(/^[0-9]{8}[A-Z]$|^[A-Z][0-9]{7}[A-Z]$|^[A-Z][0-9]{8}$/, 'Formato DNI/NIF/CIF inválido')
    .optional()
    .or(z.literal('')),
  
  // Validaciones para teléfono
  phone: z.string()
    .regex(/^\+?[1-9]\d{1,14}$/, 'Formato de teléfono inválido')
    .optional()
    .or(z.literal('')),
  
  // Validaciones para nombre
  name: z.string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede superar los 100 caracteres')
    .regex(/^[a-zA-ZáéíóúüñÁÉÍÓÚÜÑ\s\-\.]+$/, 'El nombre contiene caracteres inválidos'),
  
  // Validación condicional para empresas
  business_sector: z.string()
    .min(2, 'El sector debe tener al menos 2 caracteres')
    .max(50, 'El sector no puede superar los 50 caracteres')
    .optional()
    .or(z.literal('')),
  
  // Validación para notas internas
  internal_notes: z.string()
    .max(1000, 'Las notas no pueden superar los 1000 caracteres')
    .optional()
    .or(z.literal('')),
  
  // Validación para tarifa horaria
  hourly_rate: z.string()
    .regex(/^\d+([.,]\d{1,2})?$/, 'Formato de tarifa inválido (ej: 150.50)')
    .optional()
    .or(z.literal('')),
}).refine(
  (data) => {
    // Validación condicional: empresas deben tener representante legal
    if (data.client_type === 'empresa' && !data.legal_representative?.trim()) {
      return false
    }
    return true
  },
  {
    message: 'Las empresas deben tener un representante legal',
    path: ['legal_representative']
  }
).refine(
  (data) => {
    // Validación condicional: empresas deben tener sector de negocio
    if (data.client_type === 'empresa' && !data.business_sector?.trim()) {
      return false
    }
    return true
  },
  {
    message: 'Las empresas deben especificar su sector de actividad',
    path: ['business_sector']
  }
).refine(
  (data) => {
    // Validación: clientes activos deben tener método de pago
    if (data.status === 'activo' && data.relationship_type === 'cliente' && !data.payment_method) {
      return false
    }
    return true
  },
  {
    message: 'Los clientes activos deben tener un método de pago configurado',
    path: ['payment_method']
  }
)
