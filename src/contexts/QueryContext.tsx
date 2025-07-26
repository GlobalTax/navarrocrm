
import React, { ReactNode, useEffect } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { createOptimizedQueryClient, backgroundFetch } from '@/utils/cacheOptimizer'
import { useApp } from './AppContext'

// Create optimized query client with persistent cache
const queryClient = createOptimizedQueryClient()

interface QueryProviderProps {
  children: ReactNode
}

// Background data prefetching component
const BackgroundDataManager: React.FC = () => {
  const { user } = useApp()

  useEffect(() => {
    if (!user?.org_id || !user?.id) return

    // Prefetch critical data in background
    const prefetchData = async () => {
      try {
        // Prefetch dashboard data
        await backgroundFetch.prefetchDashboard(queryClient, user.org_id)
        
        // Prefetch user-specific data
        await backgroundFetch.prefetchUserData(queryClient, user.id, user.org_id)
        
        // Sync any offline changes
        await backgroundFetch.syncOfflineChanges(queryClient)
      } catch (error) {
        console.warn('Background prefetch failed:', error)
      }
    }

    // Initial prefetch after 1 second
    const timer = setTimeout(prefetchData, 1000)

    // Periodic background sync every 10 minutes
    const interval = setInterval(prefetchData, 1000 * 60 * 10)

    return () => {
      clearTimeout(timer)
      clearInterval(interval)
    }
  }, [user?.org_id, user?.id])

  // Sync on visibility change (when user returns to tab)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && user?.org_id) {
        backgroundFetch.syncOfflineChanges(queryClient)
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [user?.org_id])

  return null
}

export const QueryProvider: React.FC<QueryProviderProps> = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <BackgroundDataManager />
      {children}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools 
          initialIsOpen={false}
          position="bottom-right"
        />
      )}
    </QueryClientProvider>
  )
}
