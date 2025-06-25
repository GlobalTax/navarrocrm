
import { TimeTrackingHeader } from '@/components/time-tracking/TimeTrackingHeader'
import { ModernTimeTrackingDashboard } from '@/components/time-tracking/ModernTimeTrackingDashboard'
import { ModernTimer } from '@/components/time-tracking/ModernTimer'
import { OptimizedTimeEntriesTable } from '@/components/time-tracking/OptimizedTimeEntriesTable'
import { AdvancedTimeTrackingFilters } from '@/components/time-tracking/AdvancedTimeTrackingFilters'
import { TimeTrackingWithAnalytics } from '@/components/time-tracking/TimeTrackingWithAnalytics'
import { useTimeEntries } from '@/hooks/useTimeEntries'
import { StandardPageContainer } from '@/components/layout/StandardPageContainer'
import { StandardPageHeader } from '@/components/layout/StandardPageHeader'

export default function TimeTracking() {
  const {
    searchTerm,
    setSearchTerm,
    caseFilter,
    setCaseFilter,
    billableFilter,
    setBillableFilter
  } = useTimeEntries()

  const handleClearFilters = () => {
    setSearchTerm('')
    setCaseFilter('all')
    setBillableFilter('all')
  }

  return (
    <TimeTrackingWithAnalytics>
      <StandardPageContainer>
        <StandardPageHeader
          title="Control de Tiempo"
          description="Registra y gestiona el tiempo dedicado a cada expediente y tarea"
        />

        <ModernTimeTrackingDashboard />

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          <div className="xl:col-span-1 order-1 xl:order-1">
            <ModernTimer />
          </div>
          
          <div className="xl:col-span-3 space-y-6 order-2 xl:order-2">
            <AdvancedTimeTrackingFilters
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              caseFilter={caseFilter}
              onCaseFilterChange={setCaseFilter}
              billableFilter={billableFilter}
              onBillableFilterChange={setBillableFilter}
              onClearFilters={handleClearFilters}
            />
            
            <OptimizedTimeEntriesTable />
          </div>
        </div>
      </StandardPageContainer>
    </TimeTrackingWithAnalytics>
  )
}
