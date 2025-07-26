import React, { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useApp } from '@/contexts/AppContext'
import { backgroundFetch } from '@/utils/cacheOptimizer'

// Background data manager that requires AppContext
export const BackgroundDataManager: React.FC = () => {
  const { user } = useApp()
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!user?.org_id || !user?.id) return

    // Prefetch critical data in background
    const prefetchData = async () => {
      try {
        console.log('Starting background data prefetch...')
        
        // Prefetch dashboard data
        await backgroundFetch.prefetchDashboard(queryClient, user.org_id)
        
        // Prefetch user-specific data
        await backgroundFetch.prefetchUserData(queryClient, user.id, user.org_id)
        
        // Sync any offline changes
        await backgroundFetch.syncOfflineChanges(queryClient)
        
        console.log('Background data prefetch completed')
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
  }, [user?.org_id, user?.id, queryClient])

  // Sync on visibility change (when user returns to tab)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && user?.org_id) {
        console.log('Tab became visible, syncing offline changes...')
        backgroundFetch.syncOfflineChanges(queryClient)
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [user?.org_id, queryClient])

  return null
}