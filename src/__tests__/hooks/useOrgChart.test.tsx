import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// Mock AppContext
vi.mock('@/contexts/AppContext', () => ({
  useApp: () => ({ user: { id: 'u1', org_id: 'org1', role: 'partner' } }),
}))

// Mock Supabase client
const mockSelect = vi.fn()
const mockEq = vi.fn(() => ({ select: mockSelect }))
const mockFrom = vi.fn(() => ({ select: mockSelect, eq: mockEq }))
vi.mock('@/integrations/supabase/client', () => ({
  supabase: { from: mockFrom },
}))

import { useOrgChart } from '@/hooks/useOrgChart'

const wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const client = new QueryClient()
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>
}

describe('useOrgChart', () => {
  beforeEach(() => {
    mockFrom.mockClear()
    mockSelect.mockClear()
    mockEq.mockClear()
  })

  it('devuelve datos cuando la vista responde', async () => {
    mockSelect.mockResolvedValueOnce({ data: [
      { department_id: 'd1', department_name: 'Legal', department_color: null, manager_user_id: null, manager_name: 'm@acme.com', manager_avatar: null, teams: [], employees_count: 3 }
    ], error: null })

    const { result } = renderHook(() => useOrgChart(), { wrapper })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
      expect(result.current.data.length).toBe(1)
      expect(result.current.data[0].department_name).toBe('Legal')
    })
  })
})
