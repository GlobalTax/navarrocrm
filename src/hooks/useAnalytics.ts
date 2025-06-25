
import { useCallback, useEffect, useRef } from 'react'
import { useApp } from '@/contexts/AppContext'

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

  // Trackear evento
  const trackEvent = useCallback((
    category: string,
    action: string,
    label?: string,
    value?: number,
    properties?: Record<string, any>
  ) => {
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

    // Enviar a servicio de analytics
    sendToAnalyticsService(event)
  }, [user?.id])

  // Trackear vista de página
  const trackPageView = useCallback((path: string, title: string) => {
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

    sendToAnalyticsService({
      event: 'page_view',
      category: 'navigation',
      action: 'page_view',
      label: path,
      timestamp: Date.now(),
      userId: user?.id,
      sessionId: sessionId.current,
      properties: { title, path }
    })
  }, [user?.id])

  // Trackear métrica de performance
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

    sendToAnalyticsService({
      event: 'performance',
      category: 'performance',
      action: 'metric',
      label: name,
      value,
      timestamp: Date.now(),
      userId: user?.id,
      sessionId: sessionId.current,
      properties: { unit }
    })
  }, [user?.id])

  // Trackear error
  const trackError = useCallback((
    error: Error,
    context?: string,
    properties?: Record<string, any>
  ) => {
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
    sendToAnalyticsService(event)
  }, [user?.id])

  // Trackear conversión
  const trackConversion = useCallback((
    conversionType: string,
    value?: number,
    properties?: Record<string, any>
  ) => {
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
    sendToAnalyticsService(event)
  }, [user?.id])

  // Enviar datos a servicio de analytics
  const sendToAnalyticsService = useCallback((event: AnalyticsEvent) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('📊 Analytics Event:', event)
    }

    // Ejemplo con Google Analytics 4
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', event.action, {
        event_category: event.category,
        event_label: event.label,
        value: event.value,
        custom_parameters: event.properties
      })
    }

    // Ejemplo con Mixpanel
    if (typeof window !== 'undefined' && (window as any).mixpanel) {
      (window as any).mixpanel.track(event.action, {
        category: event.category,
        label: event.label,
        value: event.value,
        ...event.properties
      })
    }
  }, [])

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

  // Trackear métricas de performance automáticamente
  useEffect(() => {
    if (typeof window === 'undefined') return

    // Trackear métricas de Web Vitals
    const trackWebVitals = () => {
      // LCP (Largest Contentful Paint)
      if ('PerformanceObserver' in window) {
        try {
          new PerformanceObserver((list) => {
            const entries = list.getEntries()
            const lastEntry = entries[entries.length - 1]
            if (lastEntry) {
              trackPerformance('LCP', lastEntry.startTime, 'ms')
            }
          }).observe({ entryTypes: ['largest-contentful-paint'] })
        } catch (e) {
          console.warn('LCP tracking not supported')
        }

        // FID (First Input Delay)
        try {
          new PerformanceObserver((list) => {
            const entries = list.getEntries()
            entries.forEach((entry) => {
              trackPerformance('FID', (entry as any).processingStart - entry.startTime, 'ms')
            })
          }).observe({ entryTypes: ['first-input'] })
        } catch (e) {
          console.warn('FID tracking not supported')
        }

        // CLS (Cumulative Layout Shift)
        try {
          new PerformanceObserver((list) => {
            let clsValue = 0
            const entries = list.getEntries()
            entries.forEach((entry: any) => {
              if (!entry.hadRecentInput) {
                clsValue += entry.value
              }
            })
            trackPerformance('CLS', clsValue, 'score')
          }).observe({ entryTypes: ['layout-shift'] })
        } catch (e) {
          console.warn('CLS tracking not supported')
        }
      }
    }

    trackWebVitals()
  }, [trackPerformance])

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
    clearSessionData
  }
}
