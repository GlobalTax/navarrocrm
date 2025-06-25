
import { useEffect, useRef, useCallback } from 'react'
import { useApp } from '@/contexts/AppContext'
import { AdvancedAnalytics } from '@/services/analytics/AdvancedAnalytics'
import { AnalyticsConfig } from '@/services/analytics/types'

interface UseAdvancedAnalyticsOptions extends Partial<AnalyticsConfig> {
  autoInitialize?: boolean
}

export const useAdvancedAnalytics = (options: UseAdvancedAnalyticsOptions = {}) => {
  const { user } = useApp()
  const analyticsRef = useRef<AdvancedAnalytics | null>(null)
  const { autoInitialize = true, ...config } = options

  // Inicializar analytics
  useEffect(() => {
    if (!autoInitialize) return

    console.log('🚀 Inicializando useAdvancedAnalytics...')
    
    analyticsRef.current = new AdvancedAnalytics(config)

    // Configurar usuario si está disponible
    if (user?.id && user?.org_id) {
      analyticsRef.current.setUser(user.id, user.org_id)
    }

    return () => {
      if (analyticsRef.current) {
        analyticsRef.current.destroy()
        analyticsRef.current = null
      }
    }
  }, [autoInitialize, user?.id, user?.org_id])

  // Actualizar usuario cuando cambie
  useEffect(() => {
    if (analyticsRef.current && user?.id && user?.org_id) {
      analyticsRef.current.setUser(user.id, user.org_id)
    }
  }, [user?.id, user?.org_id])

  // Métodos públicos
  const trackEvent = useCallback((eventType: string, eventName: string, eventData?: Record<string, any>) => {
    if (analyticsRef.current) {
      analyticsRef.current.trackEvent({
        eventType,
        eventName,
        eventData,
        pageUrl: window.location.href,
        pageTitle: document.title
      })
    }
  }, [])

  const trackPageView = useCallback((url?: string, title?: string) => {
    if (analyticsRef.current) {
      analyticsRef.current.trackPageView(url, title)
    }
  }, [])

  const flush = useCallback(async () => {
    if (analyticsRef.current) {
      await analyticsRef.current.flush()
    }
  }, [])

  // Métodos de conveniencia para eventos comunes
  const trackClick = useCallback((elementId: string, additionalData?: Record<string, any>) => {
    trackEvent('interaction', 'click', { elementId, ...additionalData })
  }, [trackEvent])

  const trackFormSubmit = useCallback((formName: string, additionalData?: Record<string, any>) => {
    trackEvent('interaction', 'form_submit', { formName, ...additionalData })
  }, [trackEvent])

  const trackSearch = useCallback((searchTerm: string, resultsCount?: number, additionalData?: Record<string, any>) => {
    trackEvent('search', 'search_performed', { 
      searchTerm, 
      resultsCount, 
      ...additionalData 
    })
  }, [trackEvent])

  const trackFeatureUsage = useCallback((feature: string, action: string, additionalData?: Record<string, any>) => {
    trackEvent('feature_usage', action, { 
      feature, 
      ...additionalData 
    })
  }, [trackEvent])

  return {
    // Core methods
    trackEvent,
    trackPageView,
    flush,
    
    // Convenience methods
    trackClick,
    trackFormSubmit,
    trackSearch,
    trackFeatureUsage,
    
    // Instance access (for advanced usage)
    getInstance: () => analyticsRef.current,
    
    // Status
    isInitialized: !!analyticsRef.current
  }
}

// Hook especializado para CRM
export const useCRMAdvancedAnalytics = () => {
  const analytics = useAdvancedAnalytics({
    enabled: true,
    trackPerformance: true,
    trackErrors: true,
    trackInteractions: true,
    trackPageViews: true
  })

  const trackContactAction = useCallback((action: string, contactId: string, additionalData?: Record<string, any>) => {
    analytics.trackEvent('contacts', action, { contactId, ...additionalData })
  }, [analytics])

  const trackCaseAction = useCallback((action: string, caseId: string, additionalData?: Record<string, any>) => {
    analytics.trackEvent('cases', action, { caseId, ...additionalData })
  }, [analytics])

  const trackProposalAction = useCallback((action: string, proposalId: string, value?: number, additionalData?: Record<string, any>) => {
    analytics.trackEvent('proposals', action, { 
      proposalId, 
      value, 
      ...additionalData 
    })
  }, [analytics])

  const trackTimeEntry = useCallback((action: string, duration?: number, additionalData?: Record<string, any>) => {
    analytics.trackEvent('time_tracking', action, { 
      duration, 
      ...additionalData 
    })
  }, [analytics])

  return {
    ...analytics,
    trackContactAction,
    trackCaseAction,
    trackProposalAction,
    trackTimeEntry
  }
}
