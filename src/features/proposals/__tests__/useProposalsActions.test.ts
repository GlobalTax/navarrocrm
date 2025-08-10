import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useProposalsActions } from '../hooks/actions/useProposalsActions'
import { createElement, type ReactNode } from 'react'

// Mock dependencies
vi.mock('@/hooks/useProposalsData', () => ({
  useProposalsData: vi.fn()
}))

vi.mock('@/hooks/useCreateProposal', () => ({
  useCreateProposal: vi.fn()
}))

vi.mock('@/hooks/useUpdateProposalStatus', () => ({
  useUpdateProposalStatus: vi.fn()
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

describe('useProposalsActions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return action functions', () => {
    const mockCreateProposal = vi.fn()
    const mockUpdateProposalStatus = vi.fn()

    const mockUseProposalsData = vi.mocked(
      require('@/hooks/useProposalsData').useProposalsData
    )
    const mockUseCreateProposal = vi.mocked(
      require('@/hooks/useCreateProposal').useCreateProposal
    )
    const mockUseUpdateProposalStatus = vi.mocked(
      require('@/hooks/useUpdateProposalStatus').useUpdateProposalStatus
    )

    mockUseProposalsData.mockReturnValue({ proposals: [] })
    mockUseCreateProposal.mockReturnValue({ 
      createProposal: mockCreateProposal, 
      isCreating: false 
    })
    mockUseUpdateProposalStatus.mockReturnValue({ 
      updateProposalStatus: mockUpdateProposalStatus, 
      isUpdating: false 
    })

    const { result } = renderHook(() => useProposalsActions(), {
      wrapper: createWrapper()
    })

    expect(result.current.createProposal).toBe(mockCreateProposal)
    expect(result.current.updateProposalStatus).toBe(mockUpdateProposalStatus)
    expect(result.current.isCreating).toBe(false)
    expect(result.current.isUpdating).toBe(false)
    expect(typeof result.current.updateProposal).toBe('function')
    expect(typeof result.current.deleteProposal).toBe('function')
    expect(typeof result.current.duplicateProposal).toBe('function')
  })

  it('should pass onProposalWon callback to useUpdateProposalStatus', () => {
    const mockOnProposalWon = vi.fn()
    
    const mockUseProposalsData = vi.mocked(
      require('@/hooks/useProposalsData').useProposalsData
    )
    const mockUseCreateProposal = vi.mocked(
      require('@/hooks/useCreateProposal').useCreateProposal
    )
    const mockUseUpdateProposalStatus = vi.mocked(
      require('@/hooks/useUpdateProposalStatus').useUpdateProposalStatus
    )

    mockUseProposalsData.mockReturnValue({ proposals: [] })
    mockUseCreateProposal.mockReturnValue({ 
      createProposal: vi.fn(), 
      isCreating: false 
    })
    mockUseUpdateProposalStatus.mockReturnValue({ 
      updateProposalStatus: vi.fn(), 
      isUpdating: false 
    })

    renderHook(() => useProposalsActions(mockOnProposalWon), {
      wrapper: createWrapper()
    })

    expect(mockUseUpdateProposalStatus).toHaveBeenCalledWith([], mockOnProposalWon)
  })
})