
import React, { ReactNode } from 'react'
import { QueryClient as TanstackQueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new TanstackQueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutos
      gcTime: 1000 * 60 * 10, // 10 minutos
      retry: 1,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
    },
    mutations: {
      retry: 1,
    },
  },
})

interface QueryClientProps {
  children: ReactNode
}

export const QueryClient: React.FC<QueryClientProps> = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}
