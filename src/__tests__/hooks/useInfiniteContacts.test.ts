
import { renderHook, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useInfiniteContacts } from '@/hooks/useInfiniteContacts'
import { AppProvider } from '@/contexts/AppContext'
import React from 'react'

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  })
  
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <AppProvider>
        {children}
      </AppProvider>
    </QueryClientProvider>
  )
}

describe('useInfiniteContacts', () => {
  it('should initialize with empty contacts', () => {
    const { result } = renderHook(() => useInfiniteContacts(), {
      wrapper: createWrapper()
    })

    expect(result.current.contacts).toEqual([])
    expect(result.current.isLoading).toBe(true)
    expect(result.current.searchTerm).toBe('')
    expect(result.current.statusFilter).toBe('all')
  })

  it('should update search term', () => {
    const { result } = renderHook(() => useInfiniteContacts(), {
      wrapper: createWrapper()
    })

    act(() => {
      result.current.setSearchTerm('test search')
    })

    expect(result.current.searchTerm).toBe('test search')
  })

  it('should update filters', () => {
    const { result } = renderHook(() => useInfiniteContacts(), {
      wrapper: createWrapper()
    })

    act(() => {
      result.current.setStatusFilter('activo')
      result.current.setRelationshipFilter('cliente')
    })

    expect(result.current.statusFilter).toBe('activo')
    expect(result.current.relationshipFilter).toBe('cliente')
  })
})
