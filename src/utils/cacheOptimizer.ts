import { QueryClient } from '@tanstack/react-query'

// Strategic cache configuration for different data types
export const cacheConfig = {
  // Critical data - longest cache
  critical: {
    staleTime: 1000 * 60 * 15,        // 15 minutes
    gcTime: 1000 * 60 * 60 * 24,      // 24 hours 
    retry: 3,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  },
  
  // User data - moderate cache
  user: {
    staleTime: 1000 * 60 * 10,        // 10 minutes
    gcTime: 1000 * 60 * 60 * 4,       // 4 hours
    retry: 2,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  },
  
  // Dynamic data - short cache but with background updates
  dynamic: {
    staleTime: 1000 * 60 * 2,         // 2 minutes
    gcTime: 1000 * 60 * 30,           // 30 minutes
    retry: 1,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchInterval: 1000 * 60 * 5,   // Background update every 5 minutes
  },
  
  // Real-time data - minimal cache
  realtime: {
    staleTime: 1000 * 30,             // 30 seconds
    gcTime: 1000 * 60 * 5,            // 5 minutes
    retry: 1,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  }
} as const

// Enhanced query client with intelligent caching
export const createOptimizedQueryClient = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        ...cacheConfig.user, // Default to user cache config
        networkMode: 'offlineFirst', // Work offline when possible
      },
      mutations: {
        retry: 2,
        networkMode: 'offlineFirst',
      },
    },
  })

  return queryClient
}

// Cache key factories for consistent naming
export const cacheKeys = {
  // Dashboard data
  dashboard: ['dashboard'] as const,
  dashboardMetrics: (orgId: string) => ['dashboard', 'metrics', orgId] as const,
  dashboardActivity: (orgId: string) => ['dashboard', 'activity', orgId] as const,
  
  // User data
  users: ['users'] as const,
  user: (userId: string) => ['users', userId] as const,
  userProfile: (userId: string) => ['users', userId, 'profile'] as const,
  
  // Client data
  clients: ['clients'] as const,
  client: (clientId: string) => ['clients', clientId] as const,
  clientCases: (clientId: string) => ['clients', clientId, 'cases'] as const,
  
  // Cases data
  cases: ['cases'] as const,
  case: (caseId: string) => ['cases', caseId] as const,
  caseDocuments: (caseId: string) => ['cases', caseId, 'documents'] as const,
  caseTimeEntries: (caseId: string) => ['cases', caseId, 'time-entries'] as const,
  
  // Tasks data
  tasks: ['tasks'] as const,
  task: (taskId: string) => ['tasks', taskId] as const,
  userTasks: (userId: string) => ['tasks', 'user', userId] as const,
  
  // Time tracking
  timeEntries: ['time-entries'] as const,
  activeTimer: (userId: string) => ['time-entries', 'active', userId] as const,
  
  // Contacts
  contacts: ['contacts'] as const,
  contact: (contactId: string) => ['contacts', contactId] as const,
  
  // Documents
  documents: ['documents'] as const,
  document: (documentId: string) => ['documents', documentId] as const,
} as const

// Background fetch utilities
export const backgroundFetch = {
  // Prefetch critical dashboard data
  prefetchDashboard: async (queryClient: QueryClient, orgId: string) => {
    return Promise.allSettled([
      queryClient.prefetchQuery({
        queryKey: cacheKeys.dashboardMetrics(orgId),
        queryFn: () => fetch(`/api/dashboard/metrics?org_id=${orgId}`).then(r => r.json()),
        staleTime: cacheConfig.critical.staleTime,
      }),
      queryClient.prefetchQuery({
        queryKey: cacheKeys.dashboardActivity(orgId),
        queryFn: () => fetch(`/api/dashboard/activity?org_id=${orgId}`).then(r => r.json()),
        staleTime: cacheConfig.dynamic.staleTime,
      }),
    ])
  },
  
  // Prefetch user's common data
  prefetchUserData: async (queryClient: QueryClient, userId: string, orgId: string) => {
    return Promise.allSettled([
      queryClient.prefetchQuery({
        queryKey: cacheKeys.userTasks(userId),
        queryFn: () => fetch(`/api/tasks?user_id=${userId}&org_id=${orgId}`).then(r => r.json()),
        staleTime: cacheConfig.user.staleTime,
      }),
      queryClient.prefetchQuery({
        queryKey: cacheKeys.activeTimer(userId),
        queryFn: () => fetch(`/api/time-entries/active?user_id=${userId}`).then(r => r.json()),
        staleTime: cacheConfig.realtime.staleTime,
      }),
    ])
  },
  
  // Background sync for offline changes
  syncOfflineChanges: async (queryClient: QueryClient) => {
    const offlineData = localStorage.getItem('crm-offline-changes')
    if (!offlineData) return
    
    try {
      const changes = JSON.parse(offlineData)
      // Process offline changes
      await Promise.allSettled(
        changes.map((change: any) => 
          fetch(change.endpoint, {
            method: change.method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(change.data)
          })
        )
      )
      
      // Clear offline changes after sync
      localStorage.removeItem('crm-offline-changes')
      
      // Invalidate affected queries
      queryClient.invalidateQueries()
    } catch (error) {
      console.error('Error syncing offline changes:', error)
    }
  }
}

// Stale-while-revalidate hook
export const useStaleWhileRevalidate = <T>(
  queryKey: readonly unknown[],
  queryFn: () => Promise<T>,
  options: {
    staleTime?: number
    backgroundRefetchInterval?: number
    priority?: 'critical' | 'user' | 'dynamic' | 'realtime'
  } = {}
) => {
  const { priority = 'user', backgroundRefetchInterval = 1000 * 60 * 5 } = options
  const config = cacheConfig[priority]
  
  return {
    queryKey,
    queryFn,
    ...config,
    refetchInterval: backgroundRefetchInterval,
    refetchIntervalInBackground: true, // Keep updating in background
  }
}