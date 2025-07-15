
import { z } from 'zod'
import { baseFormSchema } from '@/types/shared/baseFormSchema'

export const contactSchema = baseFormSchema.extend({
  relationship_type: z.enum(['prospecto', 'cliente', 'ex_cliente']),
  company_id: z.string().optional(),
})
