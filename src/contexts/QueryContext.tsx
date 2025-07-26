
import React, { ReactNode, useEffect } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { createOptimizedQueryClient, backgroundFetch } from '@/utils/cacheOptimizer'

// Create optimized query client with persistent cache
const queryClient = createOptimizedQueryClient()

interface QueryProviderProps {
  children: ReactNode
}

export const QueryProvider: React.FC<QueryProviderProps> = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>
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

// Separate component that needs AppContext - will be used in App.tsx after AppProvider
export const BackgroundDataManager: React.FC = () => {
  // This will be imported and used in App.tsx where AppProvider is available
  return null
}
