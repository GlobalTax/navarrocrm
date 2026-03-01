
import { useMemo } from 'react'
import { useTimeEntries } from '@/hooks/useTimeEntries'
import { useTimeTrackingPermissions } from '@/hooks/useTimeTrackingPermissions'
import { useTeamMetricsCalculation } from './useTeamMetricsCalculation'
import { filterTimeEntriesByPeriod, calculateOverallMetrics } from './utils'
import type { TimeMetrics, TeamMetrics, MetricsPeriod } from './types'

// Re-export types for backward compatibility
export type { TimeMetrics, TeamMetrics, MetricsPeriod }

export const useTimeTrackingMetrics = (selectedPeriod: MetricsPeriod = 'week') => {
  const { timeEntries } = useTimeEntries()
  const permissions = useTimeTrackingPermissions()
  const { visibleUserIds, visibleTeamIds, accessLevel, teams, memberships, users } = permissions

  // Filter time entries based on period and permissions
  const filteredTimeEntries = useMemo(() => {
    return filterTimeEntriesByPeriod(timeEntries, selectedPeriod, visibleUserIds)
  }, [timeEntries, selectedPeriod, visibleUserIds])

  // Calculate overall metrics
  const overallMetrics: TimeMetrics = useMemo(() => {
    return calculateOverallMetrics(filteredTimeEntries)
  }, [filteredTimeEntries])

  // Calculate team metrics using dedicated hook
  const teamMetrics = useTeamMetricsCalculation({
    filteredTimeEntries,
    teams,
    visibleTeamIds,
    memberships,
    visibleUserIds,
    users,
    accessLevel
  })

  return {
    overallMetrics,
    teamMetrics,
    accessLevel,
    canViewTeams: accessLevel !== 'personal'
  }
}
