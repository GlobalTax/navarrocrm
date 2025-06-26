
import { vi } from 'vitest'
import { QueryClient } from '@tanstack/react-query'

// Crear un Query Client para tests con configuración específica
export const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      gcTime: 0,
      staleTime: 0,
    },
    mutations: {
      retry: false,
    },
  },
  logger: {
    log: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
})

// Mock de hooks de React Query
export const mockUseQuery = (data: any, isLoading = false, error: any = null) => ({
  data,
  isLoading,
  error,
  isError: !!error,
  isSuccess: !isLoading && !error,
  refetch: vi.fn(),
  remove: vi.fn(),
})

export const mockUseMutation = (mutateAsync?: any) => ({
  mutate: vi.fn(),
  mutateAsync: mutateAsync || vi.fn(),
  isLoading: false,
  isError: false,
  isSuccess: false,
  error: null,
  data: null,
  reset: vi.fn(),
})
