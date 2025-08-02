import { z } from 'zod'

// Service Item Schema
export const serviceItemSchema = z.object({
  name: z.string().min(1, 'El nombre del servicio es requerido'),
  description: z.string().optional(),
  quantity: z.number().min(1, 'La cantidad debe ser mayor a 0'),
  unitPrice: z.number().min(0, 'El precio unitario debe ser mayor o igual a 0'),
  billingCycle: z.enum(['once', 'monthly', 'quarterly', 'yearly']).default('once')
})

// Pricing Tier Schema
export const pricingTierSchema = z.object({
  name: z.string().min(1, 'El nombre del nivel es requerido'),
  description: z.string().optional(),
  services: z.array(serviceItemSchema).min(1, 'Debe haber al menos un servicio')
})

// Main Proposal Schema
export const proposalSchema = z.object({
  contactId: z.string().min(1, 'Debe seleccionar un cliente'),
  orgId: z.string().optional(),
  title: z.string().min(1, 'El título es requerido'),
  introduction: z.string().optional(),
  scopeOfWork: z.string().optional(),
  timeline: z.string().optional(),
  pricingTiers: z.array(pricingTierSchema).min(1, 'Debe haber al menos un nivel de precios'),
  validUntil: z.string().optional(),
  paymentTerms: z.string().optional(),
  isRecurring: z.boolean().optional(),
  recurringFrequency: z.enum(['monthly', 'quarterly', 'yearly']).optional(),
  contractStartDate: z.string().optional(),
  contractEndDate: z.string().optional(),
  retainerAmount: z.number().optional(),
  includedHours: z.number().optional(),
  hourlyRateExtra: z.number().optional(),
  billingDay: z.number().optional(),
  nextBillingDate: z.string().optional()
})

// Type exports
export type ServiceItemFormData = z.infer<typeof serviceItemSchema>
export type PricingTierFormData = z.infer<typeof pricingTierSchema>
export type ProposalFormData = z.infer<typeof proposalSchema>

// Legacy type for backward compatibility
export type SelectedService = ServiceItemFormData