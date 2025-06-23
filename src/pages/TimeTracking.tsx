
import { Timer } from '@/components/timer/Timer'
import { TimeEntriesTable } from '@/components/timer/TimeEntriesTable'
import { DigitalClock } from '@/components/timer/DigitalClock'
import { TimeTrackingDashboard } from '@/components/time-tracking/TimeTrackingDashboard'
import { TimeTrackingFilters } from '@/components/time-tracking/TimeTrackingFilters'
import { TimeTrackingOnboarding } from '@/components/time-tracking/TimeTrackingOnboarding'
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
    <div className="min-h-screen bg-gray-50 p-4 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center lg:text-left">
          <h1 className="text-3xl font-bold text-gray-900">Control de Tiempo</h1>
          <p className="text-gray-600 mt-2">
            Registra y gestiona tu tiempo de manera eficiente para maximizar la productividad
          </p>
        </div>

        {/* Onboarding */}
        <TimeTrackingOnboarding />

        {/* Dashboard de estadísticas */}
        <TimeTrackingDashboard />

        {/* Reloj Digital */}
        <div className="flex justify-center lg:justify-start">
          <DigitalClock />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Timer - Sidebar en desktop, top en mobile */}
          <div className="xl:col-span-1 order-1 xl:order-1">
            <Timer />
          </div>
          
          <div className="xl:col-span-2 space-y-6 order-2 xl:order-2">
            {/* Filtros */}
            <TimeTrackingFilters
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              caseFilter={caseFilter}
              onCaseFilterChange={setCaseFilter}
              billableFilter={billableFilter}
              onBillableFilterChange={setBillableFilter}
              onClearFilters={handleClearFilters}
            />
            
            {/* Tabla de entradas */}
            <TimeEntriesTable />
          </div>
        </div>
      </div>
    </div>
  )
}
