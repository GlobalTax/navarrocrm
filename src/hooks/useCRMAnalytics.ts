
import { useCallback } from 'react'
import { useAnalytics } from './useAnalytics'

// Hook especializado para analytics de CRM
export const useCRMAnalytics = () => {
  const analytics = useAnalytics()

  const trackContactAction = useCallback((
    action: 'created' | 'updated' | 'deleted' | 'viewed',
    contactId: string,
    properties?: Record<string, any>
  ) => {
    analytics.trackEvent('contacts', action, undefined, undefined, { contactId, ...properties })
  }, [analytics])

  const trackCaseAction = useCallback((
    action: 'created' | 'updated' | 'deleted' | 'viewed' | 'status_changed',
    caseId: string,
    properties?: Record<string, any>
  ) => {
    analytics.trackEvent('cases', action, undefined, undefined, { caseId, ...properties })
  }, [analytics])

  const trackProposalAction = useCallback((
    action: 'created' | 'sent' | 'accepted' | 'rejected' | 'viewed',
    proposalId: string,
    value?: number,
    properties?: Record<string, any>
  ) => {
    analytics.trackEvent('proposals', action, undefined, value, { 
      proposalId, 
      value, 
      ...properties 
    })
  }, [analytics])

  const trackTimeEntry = useCallback((
    action: 'started' | 'stopped' | 'saved',
    duration?: number,
    properties?: Record<string, any>
  ) => {
    analytics.trackEvent('time_tracking', action, undefined, duration, { 
      duration, 
      ...properties 
    })
  }, [analytics])

  const trackSearchUsage = useCallback((
    searchTerm: string,
    category: string,
    resultsCount: number,
    properties?: Record<string, any>
  ) => {
    analytics.trackEvent('search', 'search_performed', undefined, resultsCount, {
      searchTerm,
      category,
      resultsCount,
      ...properties
    })
  }, [analytics])

  const trackFeatureUsage = useCallback((
    feature: string,
    action: string,
    properties?: Record<string, any>
  ) => {
    analytics.trackEvent('feature_usage', action, undefined, undefined, { 
      feature, 
      ...properties 
    })
  }, [analytics])

  return {
    ...analytics,
    trackContactAction,
    trackCaseAction,
    trackProposalAction,
    trackTimeEntry,
    trackSearchUsage,
    trackFeatureUsage
  }
}
