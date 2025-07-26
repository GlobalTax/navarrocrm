import { useQuery } from '@tanstack/react-query'
import { cacheKeys, cacheConfig, useStaleWhileRevalidate } from '@/utils/cacheOptimizer'
import { supabase } from '@/integrations/supabase/client'

// Optimized dashboard metrics hook with strategic caching
export const useOptimizedDashboard = () => {
  const queryOptions = useStaleWhileRevalidate(
    cacheKeys.dashboardMetrics('org'), // Will be replaced with actual org_id
    async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No user found')

      // Parallel data fetching for better performance
      const [
        { data: stats, error: statsError },
        { data: quickStats, error: quickStatsError },
        { data: performanceData, error: performanceError },
        { data: recentActivities, error: activitiesError }
      ] = await Promise.all([
        supabase
          .from('dashboard_stats')
          .select('*')
          .eq('org_id', user.user_metadata?.org_id)
          .single(),
        
        supabase
          .from('dashboard_quick_stats')
          .select('*')
          .eq('org_id', user.user_metadata?.org_id)
          .single(),
        
        supabase
          .from('dashboard_performance')
          .select('*')
          .eq('org_id', user.user_metadata?.org_id)
          .order('month', { ascending: false })
          .limit(6),
        
        supabase
          .from('dashboard_activities')
          .select('*')
          .eq('org_id', user.user_metadata?.org_id)
          .order('created_at', { ascending: false })
          .limit(10)
      ])

      if (statsError) throw statsError
      if (quickStatsError) throw quickStatsError
      if (performanceError) throw performanceError
      if (activitiesError) throw activitiesError

      return {
        stats: stats || {
          totalContacts: 0,
          totalCases: 0,
          activeCases: 0,
          totalTimeEntries: 0,
          totalBillableHours: 0,
          totalNonBillableHours: 0,
          thisMonthHours: 0,
          thisMonthCases: 0,
        },
        quickStats: quickStats || {
          overdueItems: 0,
          pendingApprovals: 0,
          activeTimers: 0,
        },
        performanceData: performanceData || [],
        recentActivities: recentActivities || [],
      }
    },
    { 
      priority: 'critical',
      backgroundRefetchInterval: 1000 * 60 * 3 // Update every 3 minutes in background
    }
  )

  return useQuery(queryOptions)
}

// Optimized active timer hook with real-time updates
export const useOptimizedActiveTimer = (userId: string) => {
  const queryOptions = useStaleWhileRevalidate(
    cacheKeys.activeTimer(userId),
    async () => {
      const { data, error } = await supabase
        .from('time_entries')
        .select(`
          *,
          case:cases(title, client:clients(name)),
          task:tasks(title)
        `)
        .eq('user_id', userId)
        .is('end_time', null)
        .order('start_time', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (error) throw error
      return data
    },
    { 
      priority: 'realtime',
      backgroundRefetchInterval: 1000 * 10 // Update every 10 seconds
    }
  )

  return useQuery(queryOptions)
}

// Optimized user tasks hook with background updates
export const useOptimizedUserTasks = (userId: string) => {
  const queryOptions = useStaleWhileRevalidate(
    cacheKeys.userTasks(userId),
    async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          case:cases(title, client:clients(name)),
          assigned_user:users(name, email)
        `)
        .eq('assigned_to', userId)
        .in('status', ['pending', 'in_progress'])
        .order('due_date', { ascending: true })

      if (error) throw error
      return data || []
    },
    { 
      priority: 'user',
      backgroundRefetchInterval: 1000 * 60 * 2 // Update every 2 minutes
    }
  )

  return useQuery(queryOptions)
}

// Generic optimized query hook with cache strategy
export const useOptimizedQuery = <T>(
  key: readonly unknown[],
  queryFn: () => Promise<T>,
  options: {
    priority?: 'critical' | 'user' | 'dynamic' | 'realtime'
    backgroundRefetch?: boolean
    dependencies?: unknown[]
  } = {}
) => {
  const { priority = 'user', backgroundRefetch = true, dependencies = [] } = options
  
  const queryOptions = useStaleWhileRevalidate(
    [...key, ...dependencies],
    queryFn,
    { 
      priority,
      backgroundRefetchInterval: backgroundRefetch ? 
        (priority === 'realtime' ? 1000 * 30 : 1000 * 60 * 5) : 
        undefined
    }
  )

  return useQuery({
    ...queryOptions,
    enabled: dependencies.every(dep => dep !== undefined && dep !== null)
  })
}