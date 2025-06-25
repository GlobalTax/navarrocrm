
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
    analytics.trackEvent('contacts', action, contactId, undefined, properties)
  }, [analytics])

  const trackCaseAction = useCallback((
    action: 'created' | 'updated' | 'deleted' | 'viewed' | 'status_changed',
    caseId: string,
    properties?: Record<string, any>
  ) => {
    analytics.trackEvent('cases', action, caseId, undefined, properties)
  }, [analytics])

  const trackProposalAction = useCallback((
    action: 'created' | 'sent' | 'accepted' | 'rejected' | 'viewed',
    proposalId: string,
    value?: number,
    properties?: Record<string, any>
  ) => {
    analytics.trackEvent('proposals', action, proposalId, value, properties)
  }, [analytics])

  const trackTimeEntry = useCallback((
    action: 'started' | 'stopped' | 'saved',
    duration?: number,
    properties?: Record<string, any>
  ) => {
    analytics.trackEvent('time_tracking', action, undefined, duration, properties)
  }, [analytics])

  const trackSearchUsage = useCallback((
    searchTerm: string,
    category: string,
    resultsCount: number,
    properties?: Record<string, any>
  ) => {
    analytics.trackEvent('search', 'search_performed', searchTerm, resultsCount, {
      category,
      ...properties
    })
  }, [analytics])

  const trackFeatureUsage = useCallback((
    feature: string,
    action: string,
    properties?: Record<string, any>
  ) => {
    analytics.trackEvent('feature_usage', action, feature, undefined, properties)
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
