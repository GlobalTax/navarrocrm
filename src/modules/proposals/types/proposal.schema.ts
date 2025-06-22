
import * as z from 'zod';

export const serviceItemSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "El nombre del servicio es requerido."),
  description: z.string().optional(),
  quantity: z.number().min(1),
  unitPrice: z.number().min(0),
  billingCycle: z.enum(['once', 'monthly', 'annually', 'quarterly']),
  taxable: z.boolean(),
});

export const pricingTierSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "El nombre del plan es requerido."),
  description: z.string().optional(),
  services: z.array(serviceItemSchema),
  isFeatured: z.boolean().optional(),
  totalPrice: z.number().min(0),
});

export const proposalSchema = z.object({
  title: z.string().min(1, "El título de la propuesta es requerido."),
  clientId: z.string().min(1, "Debe seleccionar un cliente."),
  introduction: z.string().optional(),
  scopeOfWork: z.string().optional(),
  timeline: z.string().optional(),
  pricingTiers: z.array(pricingTierSchema).min(1, "Debe haber al menos un plan de precios."),
  currency: z.enum(['EUR', 'USD', 'GBP']),
  validUntil: z.date(),
});

export type ProposalFormData = z.infer<typeof proposalSchema>;
export type PricingTierFormData = z.infer<typeof pricingTierSchema>;
export type ServiceItemFormData = z.infer<typeof serviceItemSchema>;
