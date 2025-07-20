
import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react'
import { useWebVitals } from '@/hooks/performance/useWebVitals'
import { useLogger } from '@/hooks/useLogger'

interface NetworkInfo {
  effectiveType?: string
  downlink?: number
  rtt?: number
  saveData?: boolean
}

interface TelemetryData {
  sessionId: string
  startTime: number
  pageViews: number
  errors: number
  interactions: number
  webVitals: any
  userAgent: string
  connection?: NetworkInfo
}

interface TelemetryContextType {
  data: TelemetryData
  trackPageView: (path: string) => void
  trackError: (error: Error, context?: any) => void
  trackInteraction: (action: string, target: string) => void
  trackCustomEvent: (event: string, data?: any) => void
}

const TelemetryContext = createContext<TelemetryContextType | null>(null)

interface TelemetryProviderProps {
  children: ReactNode
  enableInProduction?: boolean
}

export const TelemetryProvider: React.FC<TelemetryProviderProps> = ({
  children,
  enableInProduction = false
}) => {
  const { metrics: webVitals, overallScore } = useWebVitals()
  const logger = useLogger('Telemetry')
  
  const [data, setData] = useState<TelemetryData>(() => ({
    sessionId: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    startTime: Date.now(),
    pageViews: 0,
    errors: 0,
    interactions: 0,
    webVitals: {},
    userAgent: navigator.userAgent,
    connection: (navigator as any).connection
  }))

  const shouldTrack = process.env.NODE_ENV === 'development' || enableInProduction

  useEffect(() => {
    if (!shouldTrack) return

    // Update web vitals in telemetry data
    setData(prev => ({
      ...prev,
      webVitals: { ...webVitals, overallScore }
    }))
  }, [webVitals, overallScore, shouldTrack])

  const trackPageView = useCallback((path: string) => {
    if (!shouldTrack) return

    setData(prev => ({
      ...prev,
      pageViews: prev.pageViews + 1
    }))

    logger.info('Page view tracked', {
      path,
      sessionId: data.sessionId,
      pageViews: data.pageViews + 1
    })

    // Send to analytics if available
    if (typeof (window as any).gtag === 'function') {
      (window as any).gtag('config', 'GA_MEASUREMENT_ID', {
        page_path: path,
        custom_map: { dimension1: data.sessionId }
      })
    }
  }, [shouldTrack, logger, data.sessionId, data.pageViews])

  const trackError = useCallback((error: Error, context?: any) => {
    if (!shouldTrack) return

    setData(prev => ({
      ...prev,
      errors: prev.errors + 1
    }))

    logger.error('Error tracked', {
      error: error.message,
      stack: error.stack,
      context,
      sessionId: data.sessionId,
      totalErrors: data.errors + 1
    })

    // Send to error tracking service
    if (typeof (window as any).gtag === 'function') {
      (window as any).gtag('event', 'exception', {
        description: error.message,
        fatal: false,
        session_id: data.sessionId,
        ...context
      })
    }
  }, [shouldTrack, logger, data.sessionId, data.errors])

  const trackInteraction = useCallback((action: string, target: string) => {
    if (!shouldTrack) return

    setData(prev => ({
      ...prev,
      interactions: prev.interactions + 1
    }))

    logger.info('Interaction tracked', {
      action,
      target,
      sessionId: data.sessionId,
      totalInteractions: data.interactions + 1
    })

    // Send to analytics
    if (typeof (window as any).gtag === 'function') {
      (window as any).gtag('event', action, {
        event_category: 'interaction',
        event_label: target,
        session_id: data.sessionId
      })
    }
  }, [shouldTrack, logger, data.sessionId, data.interactions])

  const trackCustomEvent = useCallback((event: string, eventData?: any) => {
    if (!shouldTrack) return

    logger.info(`Custom event: ${event}`, {
      ...eventData,
      sessionId: data.sessionId,
      timestamp: Date.now()
    })

    // Send to analytics
    if (typeof (window as any).gtag === 'function') {
      (window as any).gtag('event', event, {
        event_category: 'custom',
        session_id: data.sessionId,
        ...eventData
      })
    }
  }, [shouldTrack, logger, data.sessionId])

  useEffect(() => {
    if (!shouldTrack) return

    // Track initial page load - solo una vez
    trackPageView(window.location.pathname)

    // Monitor network changes
    const handleOnline = () => trackCustomEvent('network_online')
    const handleOffline = () => trackCustomEvent('network_offline')
    
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Monitor visibility changes
    const handleVisibilityChange = () => {
      trackCustomEvent('visibility_change', {
        hidden: document.hidden,
        visibilityState: document.visibilityState
      })
    }
    
    document.addEventListener('visibilitychange', handleVisibilityChange)

    // Monitor memory warnings
    if ('memory' in performance) {
      const checkMemory = () => {
        const memory = (performance as any).memory
        const usedMB = memory.usedJSHeapSize / 1024 / 1024
        const limitMB = memory.jsHeapSizeLimit / 1024 / 1024
        const usage = (usedMB / limitMB) * 100

        if (usage > 80) {
          trackCustomEvent('memory_warning', {
            usage: Math.round(usage),
            usedMB: Math.round(usedMB),
            limitMB: Math.round(limitMB)
          })
        }
      }

      const memoryInterval = setInterval(checkMemory, 30000) // Check every 30s
      
      return () => {
        clearInterval(memoryInterval)
        window.removeEventListener('online', handleOnline)
        window.removeEventListener('offline', handleOffline)
        document.removeEventListener('visibilitychange', handleVisibilityChange)
      }
    }

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [shouldTrack, trackPageView, trackCustomEvent])

  const contextValue: TelemetryContextType = {
    data,
    trackPageView,
    trackError,
    trackInteraction,
    trackCustomEvent
  }

  return (
    <TelemetryContext.Provider value={contextValue}>
      {children}
    </TelemetryContext.Provider>
  )
}

export const useTelemetry = () => {
  const context = useContext(TelemetryContext)
  if (!context) {
    throw new Error('useTelemetry must be used within a TelemetryProvider')
  }
  return context
}
