
import React, { useEffect } from 'react'
import { useCRMAnalytics } from '@/hooks/useCRMAnalytics'

interface TimeTrackingWithAnalyticsProps {
  children: React.ReactNode
}

export const TimeTrackingWithAnalytics = ({ children }: TimeTrackingWithAnalyticsProps) => {
  const analytics = useCRMAnalytics()

  useEffect(() => {
    analytics.trackPageView('/time-tracking', 'Control de Tiempo')
  }, [analytics])

  const trackTimerAction = (action: 'started' | 'stopped' | 'saved', duration?: number) => {
    analytics.trackTimeEntry(action, duration, {
      timestamp: Date.now(),
      page: 'time-tracking'
    })
  }

  const trackFeatureUsage = (feature: string, action: string) => {
    analytics.trackFeatureUsage(feature, action)
  }

  return (
    <div data-analytics-context="time-tracking">
      {React.cloneElement(children as React.ReactElement, {
        onTimerAction: trackTimerAction,
        onFeatureUsage: trackFeatureUsage
      })}
    </div>
  )
}
