
import { useState, useEffect } from 'react'
import { alertsManager, Alert } from '@/services/analytics/AlertsManager'

export const useAlertsManager = () => {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = alertsManager.subscribe((newAlerts) => {
      setAlerts(newAlerts)
      setIsLoading(false)
    })

    return unsubscribe
  }, [])

  const resolveAlert = (alertId: string) => {
    alertsManager.resolveAlert(alertId, 'user')
  }

  const getActiveAlerts = () => {
    return alerts.filter(alert => !alert.resolved)
  }

  const getCriticalAlerts = () => {
    return alerts.filter(alert => !alert.resolved && alert.severity === 'critical')
  }

  const getAlertsByType = (type: string) => {
    return alerts.filter(alert => alert.type === type && !alert.resolved)
  }

  return {
    alerts,
    activeAlerts: getActiveAlerts(),
    criticalAlerts: getCriticalAlerts(),
    isLoading,
    resolveAlert,
    getAlertsByType,
    activeAlertsCount: alertsManager.getActiveAlertsCount(),
    criticalAlertsCount: alertsManager.getCriticalAlertsCount()
  }
}
