
import { useState } from 'react'
import { useTimeTrackingMetrics } from '@/hooks/useTimeTrackingMetrics'
import { useTimeTrackingPermissions } from '@/hooks/useTimeTrackingPermissions'
import { DashboardHeader } from './components/DashboardHeader'
import { MetricsCards } from './components/MetricsCards'
import { TeamMetricsSection } from './components/TeamMetricsSection'
import { InsightsSection } from './components/InsightsSection'

export const AdvancedTimeTrackingDashboard = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('week')
  const [selectedTeam, setSelectedTeam] = useState<string>('all')
  
  const { accessLevel } = useTimeTrackingPermissions()
  const { overallMetrics, teamMetrics, canViewTeams } = useTimeTrackingMetrics(selectedPeriod)

  return (
    <div className="space-y-6">
      <DashboardHeader
        accessLevel={accessLevel}
        selectedPeriod={selectedPeriod}
        selectedTeam={selectedTeam}
        canViewTeams={canViewTeams}
        teamMetrics={teamMetrics}
        onPeriodChange={setSelectedPeriod}
        onTeamChange={setSelectedTeam}
      />

      <MetricsCards
        overallMetrics={overallMetrics}
        teamMetrics={teamMetrics}
        canViewTeams={canViewTeams}
      />

      <TeamMetricsSection
        canViewTeams={canViewTeams}
        teamMetrics={teamMetrics}
        selectedTeam={selectedTeam}
        accessLevel={accessLevel}
      />

      <InsightsSection
        overallMetrics={overallMetrics}
        teamMetrics={teamMetrics}
        canViewTeams={canViewTeams}
      />
    </div>
  )
}
