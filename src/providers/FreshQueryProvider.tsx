import React, { ReactNode } from 'react'
import { QueryClientProvider, QueryClient } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

// Create a completely fresh QueryClient instance
const freshQueryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes
      retry: 2,
      refetchOnWindowFocus: false,
      refetchOnMount: true,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 1,
    },
  },
})

interface FreshQueryProviderProps {
  children: ReactNode
}

export const FreshQueryProvider: React.FC<FreshQueryProviderProps> = ({ children }) => {
  console.log('🔧 FRESH_QUERY_PROVIDER: Initializing fresh QueryProvider')
  
  return (
    <QueryClientProvider client={freshQueryClient}>
      {children}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools 
          initialIsOpen={false}
          position="bottom"
        />
      )}
    </QueryClientProvider>
  )
}