
import React, { createContext, useContext, useEffect, useRef } from 'react'
import { useAdvancedAnalytics } from '@/hooks/analytics/useAdvancedAnalytics'
import { useApp } from '@/contexts/AppContext'

interface AdvancedAnalyticsContextType {
  trackEvent: (eventType: string, eventName: string, eventData?: Record<string, any>) => void
  trackPageView: (url?: string, title?: string) => void
  trackClick: (elementId: string, additionalData?: Record<string, any>) => void
  trackFormSubmit: (formName: string, additionalData?: Record<string, any>) => void
  trackSearch: (searchTerm: string, resultsCount?: number, additionalData?: Record<string, any>) => void
  trackFeatureUsage: (feature: string, action: string, additionalData?: Record<string, any>) => void
  flush: () => Promise<void>
  isInitialized: boolean
}

const AdvancedAnalyticsContext = createContext<AdvancedAnalyticsContextType | null>(null)

export const useAdvancedAnalyticsContext = () => {
  const context = useContext(AdvancedAnalyticsContext)
  if (!context) {
    throw new Error('useAdvancedAnalyticsContext must be used within AdvancedAnalyticsProvider')
  }
  return context
}

interface AdvancedAnalyticsProviderProps {
  children: React.ReactNode
}

export const AdvancedAnalyticsProvider: React.FC<AdvancedAnalyticsProviderProps> = ({ children }) => {
  const { user } = useApp()
  const isInitializedRef = useRef(false)
  const pageViewTrackedRef = useRef(false)
  
  const analytics = useAdvancedAnalytics({
    enabled: true,
    debug: import.meta.env.MODE === 'development',
    trackPerformance: true,
    trackErrors: true,
    trackInteractions: true,
    trackPageViews: false, // Desactivamos el tracking automático para controlarlo manualmente
    flushInterval: 30000, // Incrementamos el intervalo para reducir requests
    batchSize: 20 // Incrementamos el batch size
  })

  // Track página inicial cuando el provider se monta (solo una vez)
  useEffect(() => {
    if (analytics.isInitialized && !pageViewTrackedRef.current && user?.org_id) {
      analytics.trackPageView()
      pageViewTrackedRef.current = true
      console.log('📊 [Analytics] Tracked initial page view')
    }
  }, [analytics.isInitialized, user?.org_id])

  // Track cambios de ruta con debounce
  useEffect(() => {
    if (!analytics.isInitialized || !user?.org_id) return

    let timeoutId: number
    
    const handleLocationChange = () => {
      clearTimeout(timeoutId)
      timeoutId = window.setTimeout(() => {
        if (user?.org_id) {
          analytics.trackPageView()
          console.log('📊 [Analytics] Tracked route change')
        }
      }, 500) // Debounce de 500ms
    }

    // Escuchar cambios de ruta del navegador
    window.addEventListener('popstate', handleLocationChange)
    
    // También trackear cambios programáticos (para SPAs)
    const originalPushState = history.pushState
    const originalReplaceState = history.replaceState

    history.pushState = function(...args) {
      originalPushState.apply(this, args)
      handleLocationChange()
    }

    history.replaceState = function(...args) {
      originalReplaceState.apply(this, args)
      handleLocationChange()
    }

    return () => {
      clearTimeout(timeoutId)
      window.removeEventListener('popstate', handleLocationChange)
      history.pushState = originalPushState
      history.replaceState = originalReplaceState
    }
  }, [analytics.isInitialized, user?.org_id])

  // Wrapper para trackEvent que valida org_id
  const safeTrackEvent = (eventType: string, eventName: string, eventData?: Record<string, any>) => {
    if (user?.org_id && analytics.isInitialized) {
      analytics.trackEvent(eventType, eventName, eventData)
    }
  }

  // Wrapper para trackPageView que valida org_id
  const safeTrackPageView = (url?: string, title?: string) => {
    if (user?.org_id && analytics.isInitialized) {
      analytics.trackPageView(url, title)
    }
  }

  const value: AdvancedAnalyticsContextType = {
    trackEvent: safeTrackEvent,
    trackPageView: safeTrackPageView,
    trackClick: (elementId: string, additionalData?: Record<string, any>) => {
      safeTrackEvent('interaction', 'click', { elementId, ...additionalData })
    },
    trackFormSubmit: (formName: string, additionalData?: Record<string, any>) => {
      safeTrackEvent('interaction', 'form_submit', { formName, ...additionalData })
    },
    trackSearch: (searchTerm: string, resultsCount?: number, additionalData?: Record<string, any>) => {
      safeTrackEvent('search', 'search_performed', { 
        searchTerm, 
        resultsCount, 
        ...additionalData 
      })
    },
    trackFeatureUsage: (feature: string, action: string, additionalData?: Record<string, any>) => {
      safeTrackEvent('feature_usage', action, { 
        feature, 
        ...additionalData 
      })
    },
    flush: analytics.flush,
    isInitialized: analytics.isInitialized && !!user?.org_id
  }

  return (
    <AdvancedAnalyticsContext.Provider value={value}>
      {children}
    </AdvancedAnalyticsContext.Provider>
  )
}
