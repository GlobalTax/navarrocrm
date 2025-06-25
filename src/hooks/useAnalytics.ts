
import { useCallback, useEffect, useRef } from 'react'
import { useApp } from '@/contexts/AppContext'
import { useAdvancedAnalytics } from './analytics/useAdvancedAnalytics'

interface AnalyticsEvent {
  event: string
  category: string
  action: string
  label?: string
  value?: number
  timestamp: number
  userId?: string
  sessionId: string
  properties?: Record<string, any>
}

interface PageView {
  path: string
  title: string
  timestamp: number
  duration?: number
  userId?: string
  sessionId: string
}

interface PerformanceMetric {
  name: string
  value: number
  unit: string
  timestamp: number
  userId?: string
  sessionId: string
}

interface UserBehavior {
  clicks: number
  pageViews: number
  timeOnSite: number
  lastActivity: number
  sessionId: string
  userId?: string
}

export const useAnalytics = () => {
  const { user } = useApp()
  const advancedAnalytics = useAdvancedAnalytics()
  const sessionId = useRef<string>(generateSessionId())
  const events = useRef<AnalyticsEvent[]>([])
  const pageViews = useRef<PageView[]>([])
  const performanceMetrics = useRef<PerformanceMetric[]>([])
  const userBehavior = useRef<UserBehavior>({
    clicks: 0,
    pageViews: 0,
    timeOnSite: 0,
    lastActivity: Date.now(),
    sessionId: sessionId.current,
    userId: user?.id
  })

  // Generar ID de sesión único
  function generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  // Trackear evento (usa el sistema avanzado)
  const trackEvent = useCallback((
    category: string,
    action: string,
    label?: string,
    value?: number,
    properties?: Record<string, any>
  ) => {
    // Usar sistema avanzado
    advancedAnalytics.trackEvent(category, action, {
      label,
      value,
      ...properties
    })

    // Mantener compatibilidad con sistema legacy
    const event: AnalyticsEvent = {
      event: 'custom_event',
      category,
      action,
      label,
      value,
      timestamp: Date.now(),
      userId: user?.id,
      sessionId: sessionId.current,
      properties
    }

    events.current.push(event)
    userBehavior.current.clicks++
    userBehavior.current.lastActivity = Date.now()

  }, [user?.id, advancedAnalytics])

  // Trackear vista de página (usa el sistema avanzado)
  const trackPageView = useCallback((path: string, title: string) => {
    // Usar sistema avanzado
    advancedAnalytics.trackPageView(path, title)

    // Mantener compatibilidad con sistema legacy
    const pageView: PageView = {
      path,
      title,
      timestamp: Date.now(),
      userId: user?.id,
      sessionId: sessionId.current
    }

    pageViews.current.push(pageView)
    userBehavior.current.pageViews++
    userBehavior.current.lastActivity = Date.now()

    // Calcular duración de la página anterior
    if (pageViews.current.length > 1) {
      const previousPage = pageViews.current[pageViews.current.length - 2]
      const duration = pageView.timestamp - previousPage.timestamp
      previousPage.duration = duration
      userBehavior.current.timeOnSite += duration
    }

  }, [user?.id, advancedAnalytics])

  // Trackear métrica de performance (usa el sistema avanzado automáticamente)
  const trackPerformance = useCallback((
    name: string,
    value: number,
    unit: string = 'ms'
  ) => {
    const metric: PerformanceMetric = {
      name,
      value,
      unit,
      timestamp: Date.now(),
      userId: user?.id,
      sessionId: sessionId.current
    }

    performanceMetrics.current.push(metric)

    // El sistema avanzado ya captura métricas automáticamente
    // pero también permitimos tracking manual
    advancedAnalytics.trackEvent('performance', 'manual_metric', {
      metricName: name,
      value,
      unit
    })

  }, [user?.id, advancedAnalytics])

  // Trackear error (usa el sistema avanzado automáticamente)
  const trackError = useCallback((
    error: Error,
    context?: string,
    properties?: Record<string, any>
  ) => {
    advancedAnalytics.trackEvent('error', 'manual_error', {
      errorMessage: error.message,
      errorStack: error.stack,
      context,
      ...properties
    })

    // Mantener en sistema legacy
    const event: AnalyticsEvent = {
      event: 'error',
      category: 'error',
      action: 'error_occurred',
      label: error.message,
      timestamp: Date.now(),
      userId: user?.id,
      sessionId: sessionId.current,
      properties: {
        stack: error.stack,
        context,
        ...properties
      }
    }

    events.current.push(event)
  }, [user?.id, advancedAnalytics])

  // Trackear conversión
  const trackConversion = useCallback((
    conversionType: string,
    value?: number,
    properties?: Record<string, any>
  ) => {
    advancedAnalytics.trackEvent('conversion', conversionType, {
      value,
      ...properties
    })

    const event: AnalyticsEvent = {
      event: 'conversion',
      category: 'conversion',
      action: conversionType,
      value,
      timestamp: Date.now(),
      userId: user?.id,
      sessionId: sessionId.current,
      properties
    }

    events.current.push(event)
  }, [user?.id, advancedAnalytics])

  // Obtener métricas de uso
  const getUsageMetrics = useCallback(() => {
    const now = Date.now()
    const sessionDuration = now - userBehavior.current.lastActivity

    return {
      sessionId: sessionId.current,
      userId: user?.id,
      clicks: userBehavior.current.clicks,
      pageViews: userBehavior.current.pageViews,
      timeOnSite: userBehavior.current.timeOnSite + sessionDuration,
      sessionDuration,
      lastActivity: userBehavior.current.lastActivity,
      eventsCount: events.current.length,
      performanceMetricsCount: performanceMetrics.current.length
    }
  }, [user?.id])

  // Obtener eventos de la sesión
  const getSessionEvents = useCallback(() => {
    return events.current
  }, [])

  // Obtener métricas de performance
  const getPerformanceMetrics = useCallback(() => {
    return performanceMetrics.current
  }, [])

  // Limpiar datos de la sesión
  const clearSessionData = useCallback(() => {
    events.current = []
    pageViews.current = []
    performanceMetrics.current = []
    userBehavior.current = {
      clicks: 0,
      pageViews: 0,
      timeOnSite: 0,
      lastActivity: Date.now(),
      sessionId: sessionId.current,
      userId: user?.id
    }
  }, [user?.id])

  // Trackear actividad del usuario
  useEffect(() => {
    const updateActivity = () => {
      userBehavior.current.lastActivity = Date.now()
    }

    const eventTypes = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click']
    eventTypes.forEach(eventType => {
      document.addEventListener(eventType, updateActivity, { passive: true })
    })

    return () => {
      eventTypes.forEach(eventType => {
        document.removeEventListener(eventType, updateActivity)
      })
    }
  }, [])

  return {
    trackEvent,
    trackPageView,
    trackPerformance,
    trackError,
    trackConversion,
    getUsageMetrics,
    getSessionEvents,
    getPerformanceMetrics,
    clearSessionData,
    
    // Compatibilidad con sistema avanzado
    ...advancedAnalytics
  }
}
