
import { TimeTrackingHeader } from '@/components/time-tracking/TimeTrackingHeader'
import { ModernTimeTrackingDashboard } from '@/components/time-tracking/ModernTimeTrackingDashboard'
import { ModernTimer } from '@/components/time-tracking/ModernTimer'
import { OptimizedTimeEntriesTable } from '@/components/time-tracking/OptimizedTimeEntriesTable'
import { AdvancedTimeTrackingFilters } from '@/components/time-tracking/AdvancedTimeTrackingFilters'
import { useTimeEntries } from '@/hooks/useTimeEntries'

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
    <div className="min-h-screen bg-gray-50 p-4 lg:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header simplificado */}
        <TimeTrackingHeader />

        {/* Dashboard con métricas inteligentes */}
        <ModernTimeTrackingDashboard />

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Timer moderno - Sidebar en desktop */}
          <div className="xl:col-span-1 order-1 xl:order-1">
            <ModernTimer />
          </div>
          
          {/* Tabla y filtros optimizados */}
          <div className="xl:col-span-3 space-y-6 order-2 xl:order-2">
            {/* Filtros avanzados */}
            <AdvancedTimeTrackingFilters
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              caseFilter={caseFilter}
              onCaseFilterChange={setCaseFilter}
              billableFilter={billableFilter}
              onBillableFilterChange={setBillableFilter}
              onClearFilters={handleClearFilters}
            />
            
            {/* Tabla optimizada */}
            <OptimizedTimeEntriesTable />
          </div>
        </div>
      </div>
    </div>
  )
}
