
import React, { createContext, useContext, useEffect } from 'react'
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
  const analytics = useAdvancedAnalytics({
    enabled: true,
    debug: import.meta.env.MODE === 'development',
    trackPerformance: true,
    trackErrors: true,
    trackInteractions: true,
    trackPageViews: true
  })

  // Track página inicial cuando el provider se monta
  useEffect(() => {
    if (analytics.isInitialized) {
      analytics.trackPageView()
    }
  }, [analytics.isInitialized])

  // Track cambios de ruta
  useEffect(() => {
    const handleLocationChange = () => {
      analytics.trackPageView()
    }

    // Escuchar cambios de ruta del navegador
    window.addEventListener('popstate', handleLocationChange)
    
    // También trackear cambios programáticos (para SPAs)
    const originalPushState = history.pushState
    const originalReplaceState = history.replaceState

    history.pushState = function(...args) {
      originalPushState.apply(this, args)
      setTimeout(handleLocationChange, 0)
    }

    history.replaceState = function(...args) {
      originalReplaceState.apply(this, args)
      setTimeout(handleLocationChange, 0)
    }

    return () => {
      window.removeEventListener('popstate', handleLocationChange)
      history.pushState = originalPushState
      history.replaceState = originalReplaceState
    }
  }, [analytics])

  const value: AdvancedAnalyticsContextType = {
    trackEvent: analytics.trackEvent,
    trackPageView: analytics.trackPageView,
    trackClick: analytics.trackClick,
    trackFormSubmit: analytics.trackFormSubmit,
    trackSearch: analytics.trackSearch,
    trackFeatureUsage: analytics.trackFeatureUsage,
    flush: analytics.flush,
    isInitialized: analytics.isInitialized
  }

  return (
    <AdvancedAnalyticsContext.Provider value={value}>
      {children}
    </AdvancedAnalyticsContext.Provider>
  )
}
