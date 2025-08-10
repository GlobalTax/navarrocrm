import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useProposalsQueries } from '../hooks/data/useProposalsQueries'
import { createElement, type ReactNode } from 'react'

// Mock dependencies
vi.mock('@/hooks/useProposalsData', () => ({
  useProposalsData: vi.fn()
}))

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })
  
  return function TestWrapper({ children }: { children: ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children)
  }
}

describe('useProposalsQueries', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return default values when no data', () => {
    const mockUseProposalsData = vi.mocked(
      require('@/hooks/useProposalsData').useProposalsData
    )
    mockUseProposalsData.mockReturnValue({
      proposals: null,
      isLoading: false,
      error: null,
      refetch: vi.fn()
    })

    const { result } = renderHook(() => useProposalsQueries(), {
      wrapper: createWrapper()
    })

    expect(result.current.proposals).toEqual([])
    expect(result.current.isLoading).toBe(false)
    expect(result.current.error).toBe(null)
  })

  it('should return proposals data when available', () => {
    const mockProposals = [
      { id: '1', title: 'Test Proposal', status: 'draft' }
    ]
    
    const mockUseProposalsData = vi.mocked(
      require('@/hooks/useProposalsData').useProposalsData
    )
    mockUseProposalsData.mockReturnValue({
      proposals: mockProposals,
      isLoading: false,
      error: null,
      refetch: vi.fn()
    })

    const { result } = renderHook(() => useProposalsQueries(), {
      wrapper: createWrapper()
    })

    expect(result.current.proposals).toEqual(mockProposals)
    expect(result.current.isLoading).toBe(false)
    expect(result.current.error).toBe(null)
  })

  it('should handle loading state', () => {
    const mockUseProposalsData = vi.mocked(
      require('@/hooks/useProposalsData').useProposalsData
    )
    mockUseProposalsData.mockReturnValue({
      proposals: [],
      isLoading: true,
      error: null,
      refetch: vi.fn()
    })

    const { result } = renderHook(() => useProposalsQueries(), {
      wrapper: createWrapper()
    })

    expect(result.current.isLoading).toBe(true)
  })

  it('should handle error state', () => {
    const mockError = new Error('Test error')
    
    const mockUseProposalsData = vi.mocked(
      require('@/hooks/useProposalsData').useProposalsData
    )
    mockUseProposalsData.mockReturnValue({
      proposals: [],
      isLoading: false,
      error: mockError,
      refetch: vi.fn()
    })

    const { result } = renderHook(() => useProposalsQueries(), {
      wrapper: createWrapper()
    })

    expect(result.current.error).toBe(mockError)
  })
})