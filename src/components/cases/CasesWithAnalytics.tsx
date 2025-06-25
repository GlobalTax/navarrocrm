
import { useEffect } from 'react'
import { useCRMAnalytics } from '@/hooks/useCRMAnalytics'
import { Case } from '@/hooks/useCases'

interface CasesWithAnalyticsProps {
  cases: Case[]
  searchTerm: string
  filteredCases: Case[]
  children: React.ReactNode
}

export const CasesWithAnalytics = ({
  cases,
  searchTerm,
  filteredCases,
  children
}: CasesWithAnalyticsProps) => {
  const analytics = useCRMAnalytics()

  // Trackear vista de página cuando se monta el componente
  useEffect(() => {
    analytics.trackPageView('/cases', 'Expedientes')
  }, [analytics])

  // Trackear búsquedas
  useEffect(() => {
    if (searchTerm.trim()) {
      analytics.trackSearchUsage(
        searchTerm,
        'cases',
        filteredCases.length,
        { totalCases: cases.length }
      )
    }
  }, [searchTerm, filteredCases.length, cases.length, analytics])

  // Trackear uso de funcionalidades
  const trackCaseView = (caseId: string) => {
    analytics.trackCaseAction('viewed', caseId)
  }

  const trackCaseEdit = (caseId: string) => {
    analytics.trackCaseAction('updated', caseId)
  }

  const trackCaseDelete = (caseId: string) => {
    analytics.trackCaseAction('deleted', caseId)
  }

  const trackCaseCreate = (caseId: string) => {
    analytics.trackCaseAction('created', caseId)
  }

  const trackFeatureUsage = (feature: string, action: string) => {
    analytics.trackFeatureUsage(feature, action)
  }

  // Proporcionar funciones de tracking a los componentes hijos
  return (
    <div data-analytics-context="cases">
      {React.cloneElement(children as React.ReactElement, {
        onCaseView: trackCaseView,
        onCaseEdit: trackCaseEdit,
        onCaseDelete: trackCaseDelete,
        onCaseCreate: trackCaseCreate,
        onFeatureUsage: trackFeatureUsage
      })}
    </div>
  )
}
