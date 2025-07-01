
import { z } from 'zod'

// Esquema para servicios seleccionados
export const selectedServiceSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  basePrice: z.number(),
  customPrice: z.number().optional(),
  quantity: z.number().optional().default(1),
  billingUnit: z.string().optional(),
  estimatedHours: z.number().optional(),
  total: z.number().optional()
})

// Esquema para configuración de retainer
export const retainerConfigSchema = z.object({
  retainerAmount: z.number().optional(),
  includedHours: z.number().optional(),
  extraHourlyRate: z.number().optional(),
  billingFrequency: z.enum(['monthly', 'quarterly', 'yearly']),
  billingDay: z.number(),
  autoRenewal: z.boolean(),
  contractDuration: z.number(),
  paymentTerms: z.number()
})

// Esquema para elementos de servicio (para PricingTier)
export const serviceItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  quantity: z.number().default(1),
  unitPrice: z.number(),
  billingCycle: z.enum(['once', 'monthly', 'annually', 'quarterly']),
  taxable: z.boolean().default(true)
})

// Esquema para niveles de precios
export const pricingTierSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  services: z.array(serviceItemSchema),
  totalPrice: z.number().default(0)
})

// Esquema principal de propuesta
export const proposalSchema = z.object({
  clientId: z.string(),
  selectedArea: z.string().optional(),
  selectedServices: z.array(selectedServiceSchema).optional(),
  retainerConfig: retainerConfigSchema.optional(),
  title: z.string(),
  introduction: z.string().optional(),
  terms: z.string().optional(),
  validityDays: z.number().optional(),
  is_recurring: z.boolean().optional(),
  recurring_frequency: z.string().optional(),
  
  // Campos adicionales para el ProposalBuilder
  currency: z.string().default('EUR'),
  validUntil: z.date().optional(),
  scopeOfWork: z.string().optional(),
  timeline: z.string().optional(),
  pricingTiers: z.array(pricingTierSchema).optional()
})

// Exportar tipos
export interface ProposalFormData extends z.infer<typeof proposalSchema> {}

export interface SelectedService extends z.infer<typeof selectedServiceSchema> {}

export interface RetainerConfig extends z.infer<typeof retainerConfigSchema> {}

export interface ServiceItemFormData extends z.infer<typeof serviceItemSchema> {}

export interface PricingTierFormData extends z.infer<typeof pricingTierSchema> {}
