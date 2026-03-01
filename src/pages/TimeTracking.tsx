import { useState } from 'react'
// import { TimeTrackingHeader } from '@/components/time-tracking/TimeTrackingHeader'
// import { ModernTimeTrackingDashboard } from '@/components/time-tracking/ModernTimeTrackingDashboard'
// import { AdvancedTimeTrackingDashboard } from '@/components/time-tracking/AdvancedTimeTrackingDashboard'
import { ModernTimer } from '@/components/time-tracking/ModernTimer'
import { FloatingTimer } from '@/components/time-tracking/FloatingTimer'
// import { TimeTemplateManager } from '@/components/time-tracking/TimeTemplateManager'
import { OptimizedTimeEntriesTable } from '@/components/time-tracking/OptimizedTimeEntriesTable'
// import { AdvancedTimeTrackingFilters } from '@/components/time-tracking/AdvancedTimeTrackingFilters'
// import { TimeTrackingSummary } from '@/components/time-tracking/TimeTrackingSummary'
import { HeaderTimerDialog } from '@/components/layout/HeaderTimerDialog'
import { useTimeEntries } from '@/hooks/useTimeEntries'
import { StandardPageContainer } from '@/components/layout/StandardPageContainer'
import { StandardPageHeader } from '@/components/layout/StandardPageHeader'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Clock, Timer, DollarSign, Settings2 } from 'lucide-react'
import { toast } from 'sonner'
// import { TimePlanningTab } from '@/components/time-tracking/TimePlanningTab'
import { Link } from 'react-router-dom'
// import { VisibleCard } from '@/components/ui/VisibleCard'
import { BillingActions } from '@/components/time/BillingActions'
import { EnhancedTimeTrackingFilters } from '@/components/time-tracking/EnhancedTimeTrackingFilters'
import { useUIPreferences } from '@/hooks/useUIPreferences'
import { ActivityTypesManager } from '@/components/settings/ActivityTypesManager'

export default function TimeTracking() {
  const {
    searchTerm,
    setSearchTerm,
    caseFilter,
    setCaseFilter,
    billableFilter,
    setBillableFilter,
    createTimeEntry,
    timeEntries
  } = useTimeEntries()

  const [showFloatingTimer, setShowFloatingTimer] = useState(false)
  const [showTimerDialog, setShowTimerDialog] = useState(false)
  const [timerSeconds, setTimerSeconds] = useState(0)
  const [activeTab, setActiveTab] = useState('timer')

  const handleClearFilters = () => {
    setSearchTerm('')
    setCaseFilter('all')
    setBillableFilter('all')
  }

  const handleFloatingTimerSave = (seconds: number) => {
    setTimerSeconds(seconds)
    setShowTimerDialog(true)
  }

  const handleTimerDialogSave = () => {
    setShowTimerDialog(false)
    setTimerSeconds(0)
    toast.success('Tiempo registrado correctamente')
  }

  // const { showKpis, toggleKpis } = useUIPreferences('time-tracking', { showKpis: false })

  return (
    <StandardPageContainer>
      <StandardPageHeader
        title="Control de Tiempo"
        description="Registra y gestiona el tiempo dedicado a cada expediente y tarea"
        actions={
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFloatingTimer(!showFloatingTimer)}
            >
              <Timer className="h-4 w-4 mr-1" />
              {showFloatingTimer ? 'Ocultar' : 'Mostrar'} Timer Flotante
            </Button>
          </div>
        }
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="timer" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Timer
          </TabsTrigger>
          <TabsTrigger value="entries" className="flex items-center gap-2">
            <Timer className="h-4 w-4" />
            Registros
          </TabsTrigger>
          <TabsTrigger value="billing" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Facturación
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings2 className="h-4 w-4" />
            Tipos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="timer" className="space-y-6">
          <ModernTimer />
        </TabsContent>

        <TabsContent value="entries" className="space-y-6">
          <div className="space-y-4">
            <EnhancedTimeTrackingFilters />
            <OptimizedTimeEntriesTable />
          </div>
        </TabsContent>

        <TabsContent value="billing" className="space-y-6">
          <BillingActions timeEntries={timeEntries} />
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <ActivityTypesManager />
        </TabsContent>
      </Tabs>

      {/* Timer Flotante */}
      {showFloatingTimer && (
        <FloatingTimer onSave={handleFloatingTimerSave} />
      )}

      {/* Dialog para guardar tiempo del timer flotante */}
      <HeaderTimerDialog
        isOpen={showTimerDialog}
        onClose={() => setShowTimerDialog(false)}
        onSave={handleTimerDialogSave}
        timerSeconds={timerSeconds}
      />
    </StandardPageContainer>
  )
}
