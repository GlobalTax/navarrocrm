import { render } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryProvider } from '@tanstack/react-query'

export const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: { retry: false, gcTime: 0 },
    mutations: { retry: false },
  },
})

export const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = createTestQueryClient()
  return (
    <QueryProvider client={queryClient}>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </QueryProvider>
  )
}

export const renderWithProviders = (ui: React.ReactElement, options?: any) => {
  return render(ui, { wrapper: TestWrapper, ...options })
}

export const createMockContact = (overrides = {}) => ({
  id: '1',
  first_name: 'John',
  last_name: 'Doe',
  email: 'john@example.com',
  ...overrides
})

export const measurePerformance = async (operation: () => Promise<void>) => {
  const start = performance.now()
  await operation()
  return performance.now() - start
}