/**
 * Test Helpers - Utilidades comunes para testing
 * Proporciona mocks y helpers reutilizables para tests
 */

import { QueryClient } from '@tanstack/react-query'
import { createLogger } from '@/utils/logging'
import { vi } from 'vitest'

const testLogger = createLogger('Testing')

/**
 * Crea un QueryClient limpio para tests
 */
export const createTestQueryClient = () => {
  testLogger.debug('Creando QueryClient para tests')
  
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  })
}

/**
 * Mock de usuario autenticado para tests
 */
export const mockAuthUser = {
  id: 'test-user-id',
  email: 'test@example.com',
  role: 'partner' as const,
  org_id: 'test-org-id',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z'
}

/**
 * Mock de organización para tests
 */
export const mockOrganization = {
  id: 'test-org-id',
  name: 'Test Organization',
  subscription_tier: 'pro' as const,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z'
}

/**
 * Delay helper para tests asíncronos
 */
export const waitFor = (ms: number) => 
  new Promise(resolve => setTimeout(resolve, ms))

/**
 * Helper para testing de hooks (Vitest version)
 */
export const createMockSupabaseClient = () => ({
  auth: {
    getUser: vi.fn(),
    getSession: vi.fn(),
    onAuthStateChange: vi.fn(),
  },
  from: vi.fn(() => ({
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn(),
  })),
})

testLogger.info('Test helpers inicializados')