import { useState } from 'react'
import { TimeTrackingHeader } from '@/components/time-tracking/TimeTrackingHeader'
import { ModernTimeTrackingDashboard } from '@/components/time-tracking/ModernTimeTrackingDashboard'
import { AdvancedTimeTrackingDashboard } from '@/components/time-tracking/AdvancedTimeTrackingDashboard'
import { ModernTimer } from '@/components/time-tracking/ModernTimer'
import { FloatingTimer } from '@/components/time-tracking/FloatingTimer'
import { TimeTemplateManager } from '@/components/time-tracking/TimeTemplateManager'
import { OptimizedTimeEntriesTable } from '@/components/time-tracking/OptimizedTimeEntriesTable'
import { AdvancedTimeTrackingFilters } from '@/components/time-tracking/AdvancedTimeTrackingFilters'
import { TimeTrackingSummary } from '@/components/time-tracking/TimeTrackingSummary'
import { HeaderTimerDialog } from '@/components/layout/HeaderTimerDialog'
import { useTimeEntries } from '@/hooks/useTimeEntries'
import { StandardPageContainer } from '@/components/layout/StandardPageContainer'
import { StandardPageHeader } from '@/components/layout/StandardPageHeader'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Clock, BarChart3, Timer, FileText, Calendar } from 'lucide-react'
import { toast } from 'sonner'
import { TimePlanningTab } from '@/components/time-tracking/TimePlanningTab'
import { Link } from 'react-router-dom'

export default function TimeTracking() {
  const {
    searchTerm,
    setSearchTerm,
    caseFilter,
    setCaseFilter,
    billableFilter,
    setBillableFilter,
    createTimeEntry
  } = useTimeEntries()

  const [showFloatingTimer, setShowFloatingTimer] = useState(false)
  const [showTimerDialog, setShowTimerDialog] = useState(false)
  const [timerSeconds, setTimerSeconds] = useState(0)
  const [activeTab, setActiveTab] = useState('dashboard')

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

  const handleUseTemplate = (template: any) => {
    // Auto-llenar formulario de timer con la plantilla
    toast.success(`Plantilla "${template.name}" aplicada`)
    console.log('Using template:', template)
  }

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
            <Button variant="outline" size="sm" asChild>
              <Link to="/reports/monthly-service-hours">Reporte mensual</Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link to="/recurring-services/dashboard">Dashboard servicios</Link>
            </Button>
          </div>
        }
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="timer" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Timer
          </TabsTrigger>
          <TabsTrigger value="summary" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Resumen
          </TabsTrigger>
          <TabsTrigger value="planning" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Planificación
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Plantillas
          </TabsTrigger>
          <TabsTrigger value="entries" className="flex items-center gap-2">
            <Timer className="h-4 w-4" />
            Registros
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <AdvancedTimeTrackingDashboard />
        </TabsContent>

        <TabsContent value="timer" className="space-y-6">
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
            <div className="xl:col-span-1">
              <ModernTimer />
            </div>
            
            <div className="xl:col-span-3">
              <ModernTimeTrackingDashboard />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="summary" className="space-y-6">
          <TimeTrackingSummary />
        </TabsContent>

        <TabsContent value="planning" className="space-y-6">
          <TimePlanningTab />
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <TimeTemplateManager onUseTemplate={handleUseTemplate} />
        </TabsContent>

        <TabsContent value="entries" className="space-y-6">
          <div className="space-y-4">
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
