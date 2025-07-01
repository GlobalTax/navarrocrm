
import { z } from 'zod'
import DOMPurify from 'dompurify'

export const clientSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  phone: z.string().regex(/^\+?[\d\s\-\(\)]+$/),
  dni_nif: z.string().regex(/^[0-9A-Z]{8,9}$/),
})

export const sanitizeInput = (input: string) => {
  return DOMPurify.sanitize(input, { ALLOWED_TAGS: [] })
}
