
import { describe, it, expect, beforeEach } from 'vitest'
import { clientSchema, sanitizeInput } from '@/lib/validation'

describe('validation', () => {
  describe('clientSchema', () => {
    it('should validate correct client data', () => {
      const validClient = {
        name: 'Juan Pérez',
        email: 'juan@example.com',
        phone: '+34 123 456 789',
        dni_nif: '12345678A'
      }

      const result = clientSchema.safeParse(validClient)
      expect(result.success).toBe(true)
    })

    it('should reject invalid email', () => {
      const invalidClient = {
        name: 'Juan Pérez',
        email: 'invalid-email',
        phone: '+34 123 456 789',
        dni_nif: '12345678A'
      }

      const result = clientSchema.safeParse(invalidClient)
      expect(result.success).toBe(false)
    })

    it('should reject short name', () => {
      const invalidClient = {
        name: 'J',
        email: 'juan@example.com',
        phone: '+34 123 456 789',
        dni_nif: '12345678A'
      }

      const result = clientSchema.safeParse(invalidClient)
      expect(result.success).toBe(false)
    })

    it('should reject invalid phone format', () => {
      const invalidClient = {
        name: 'Juan Pérez',
        email: 'juan@example.com',
        phone: 'invalid-phone',
        dni_nif: '12345678A'
      }

      const result = clientSchema.safeParse(invalidClient)
      expect(result.success).toBe(false)
    })

    it('should reject invalid DNI/NIF format', () => {
      const invalidClient = {
        name: 'Juan Pérez',
        email: 'juan@example.com',
        phone: '+34 123 456 789',
        dni_nif: 'invalid'
      }

      const result = clientSchema.safeParse(invalidClient)
      expect(result.success).toBe(false)
    })
  })

  describe('sanitizeInput', () => {
    it('should remove HTML tags', () => {
      const input = '<script>alert("xss")</script>Hello World'
      const result = sanitizeInput(input)
      expect(result).toBe('Hello World')
    })

    it('should preserve plain text', () => {
      const input = 'Hello World'
      const result = sanitizeInput(input)
      expect(result).toBe('Hello World')
    })

    it('should handle empty string', () => {
      const input = ''
      const result = sanitizeInput(input)
      expect(result).toBe('')
    })
  })
})
