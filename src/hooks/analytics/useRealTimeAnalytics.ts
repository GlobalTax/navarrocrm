
import { useState, useEffect, useCallback, useRef } from 'react'
import { useAdvancedAnalytics } from './useAdvancedAnalytics'
import { supabase } from '@/integrations/supabase/client'
import { useApp } from '@/contexts/AppContext'

interface RealTimeMetrics {
  activeUsers: number
  pageViews: number
  totalErrors: number
  avgPerformance: {
    lcp: number
    fid: number
    cls: number
  }
  topPages: Array<{ page: string; views: number }>
  errorRate: number
  lastUpdated: Date
}

interface SessionData {
  sessionId: string
  userId?: string
  pageViews: number
  errorsCount: number
  duration: number
  lastActivity: Date
}

export const useRealTimeAnalytics = () => {
  const { user } = useApp()
  const analytics = useAdvancedAnalytics()
  const [metrics, setMetrics] = useState<RealTimeMetrics>({
    activeUsers: 0,
    pageViews: 0,
    totalErrors: 0,
    avgPerformance: { lcp: 0, fid: 0, cls: 0 },
    topPages: [],
    errorRate: 0,
    lastUpdated: new Date()
  })
  const [activeSessions, setActiveSessions] = useState<SessionData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const intervalRef = useRef<number>()

  const fetchRealTimeMetrics = useCallback(async () => {
    if (!user?.org_id) return

    try {
      const now = new Date()
      const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000)
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000)

      // Fetch active sessions (last 5 minutes)
      const { data: sessions, error: sessionsError } = await supabase
        .from('analytics_sessions')
        .select('session_id, user_id, page_views, errors_count, start_time, end_time')
        .eq('org_id', user.org_id)
        .gte('start_time', fiveMinutesAgo.toISOString())
        .order('start_time', { ascending: false })

      if (sessionsError) throw sessionsError

      // Fetch recent events
      const { data: events, error: eventsError } = await supabase
        .from('analytics_events')
        .select('event_type, page_url, timestamp')
        .eq('org_id', user.org_id)
        .gte('timestamp', oneHourAgo.toISOString())

      if (eventsError) throw eventsError

      // Fetch errors
      const { data: errors, error: errorsError } = await supabase
        .from('analytics_errors')
        .select('id, timestamp, error_type')
        .eq('org_id', user.org_id)
        .gte('timestamp', oneHourAgo.toISOString())

      if (errorsError) throw errorsError

      // Fetch performance metrics
      const { data: performance, error: perfError } = await supabase
        .from('analytics_performance')
        .select('largest_contentful_paint, first_input_delay, cumulative_layout_shift')
        .eq('org_id', user.org_id)
        .gte('timestamp', oneHourAgo.toISOString())
        .not('largest_contentful_paint', 'is', null)
        .not('first_input_delay', 'is', null)
        .not('cumulative_layout_shift', 'is', null)

      if (perfError) throw perfError

      // Process sessions data
      const processedSessions: SessionData[] = sessions?.map(session => ({
        sessionId: session.session_id,
        userId: session.user_id,
        pageViews: session.page_views || 0,
        errorsCount: session.errors_count || 0,
        duration: session.end_time 
          ? new Date(session.end_time).getTime() - new Date(session.start_time).getTime()
          : Date.now() - new Date(session.start_time).getTime(),
        lastActivity: new Date(session.end_time || session.start_time)
      })) || []

      // Calculate top pages
      const pageViewsMap = new Map<string, number>()
      events?.forEach(event => {
        if (event.event_type === 'navigation' && event.page_url) {
          const url = new URL(event.page_url).pathname
          pageViewsMap.set(url, (pageViewsMap.get(url) || 0) + 1)
        }
      })

      const topPages = Array.from(pageViewsMap.entries())
        .map(([page, views]) => ({ page, views }))
        .sort((a, b) => b.views - a.views)
        .slice(0, 5)

      // Calculate average performance
      const avgPerformance = {
        lcp: performance?.reduce((sum, p) => sum + (p.largest_contentful_paint || 0), 0) / (performance?.length || 1) || 0,
        fid: performance?.reduce((sum, p) => sum + (p.first_input_delay || 0), 0) / (performance?.length || 1) || 0,
        cls: performance?.reduce((sum, p) => sum + (p.cumulative_layout_shift || 0), 0) / (performance?.length || 1) || 0
      }

      const totalEvents = events?.length || 0
      const totalErrors = errors?.length || 0
      const errorRate = totalEvents > 0 ? (totalErrors / totalEvents) * 100 : 0

      setMetrics({
        activeUsers: processedSessions.length,
        pageViews: totalEvents,
        totalErrors,
        avgPerformance,
        topPages,
        errorRate,
        lastUpdated: new Date()
      })

      setActiveSessions(processedSessions)
      setIsLoading(false)

    } catch (error) {
      console.error('Error fetching real-time metrics:', error)
      setIsLoading(false)
    }
  }, [user?.org_id])

  // Start real-time updates
  useEffect(() => {
    if (user?.org_id) {
      fetchRealTimeMetrics()
      
      intervalRef.current = window.setInterval(() => {
        fetchRealTimeMetrics()
      }, 5000) // Update every 5 seconds

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current)
        }
      }
    }
  }, [fetchRealTimeMetrics, user?.org_id])

  const refreshMetrics = useCallback(() => {
    fetchRealTimeMetrics()
  }, [fetchRealTimeMetrics])

  return {
    metrics,
    activeSessions,
    isLoading,
    refreshMetrics,
    isRealTime: true
  }
}
