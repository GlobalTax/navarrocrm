
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Clock, FileText, Users, Euro, Calendar, AlertTriangle } from 'lucide-react'
import { Case } from '@/hooks/useCases'
import { CasePhaseManager } from './CasePhaseManager'
import { CaseTasksPanel } from './CaseTasksPanel'
import { CaseTimeTracker } from './CaseTimeTracker'
import { CaseDocumentsHub } from './CaseDocumentsHub'
import { CaseFinanceDashboard } from './CaseFinanceDashboard'
import { CaseTimeline } from './CaseTimeline'
import { CaseMetrics } from './CaseMetrics'
import { CaseAlerts } from './CaseAlerts'

interface CaseWorkspaceProps {
  case_: Case
  onClose: () => void
}

export function CaseWorkspace({ case_, onClose }: CaseWorkspaceProps) {
  const [activeTab, setActiveTab] = useState('overview')

  // Mock data - en producción vendría de hooks
  const caseProgress = 45
  const totalTasks = 12
  const completedTasks = 5
  const totalHours = 18.5
  const budgetUsed = 75

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-800'
      case 'on_hold': return 'bg-yellow-100 text-yellow-800'
      case 'closed': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'open': return 'Abierto'
      case 'on_hold': return 'En Espera'
      case 'closed': return 'Cerrado'
      default: return status
    }
  }

  return (
    <div className="fixed inset-0 bg-background z-50 overflow-hidden">
      {/* Header */}
      <div className="border-b bg-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={onClose}>
              ← Volver
            </Button>
            <div>
              <h1 className="text-2xl font-bold">{case_.title}</h1>
              <p className="text-gray-600">{case_.description}</p>
            </div>
            <Badge className={getStatusColor(case_.status)}>
              {getStatusLabel(case_.status)}
            </Badge>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-sm text-gray-500">Progreso General</div>
              <div className="flex items-center gap-2">
                <Progress value={caseProgress} className="w-32" />
                <span className="text-sm font-medium">{caseProgress}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="border-b bg-gray-50 p-4">
        <div className="grid grid-cols-5 gap-4">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-blue-500" />
            <div>
              <div className="text-sm text-gray-500">Tiempo Total</div>
              <div className="font-semibold">{totalHours}h</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-green-500" />
            <div>
              <div className="text-sm text-gray-500">Tareas</div>
              <div className="font-semibold">{completedTasks}/{totalTasks}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Euro className="h-5 w-5 text-purple-500" />
            <div>
              <div className="text-sm text-gray-500">Presupuesto</div>
              <div className="font-semibold">{budgetUsed}%</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-orange-500" />
            <div>
              <div className="text-sm text-gray-500">Cliente</div>
              <div className="font-semibold">{case_.contact?.name || 'Sin asignar'}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-red-500" />
            <div>
              <div className="text-sm text-gray-500">Creado</div>
              <div className="font-semibold">
                {new Date(case_.created_at).toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
          <TabsList className="w-full justify-start border-b bg-white px-4">
            <TabsTrigger value="overview">Resumen</TabsTrigger>
            <TabsTrigger value="phases">Fases</TabsTrigger>
            <TabsTrigger value="tasks">Tareas</TabsTrigger>
            <TabsTrigger value="time">Tiempo</TabsTrigger>
            <TabsTrigger value="documents">Documentos</TabsTrigger>
            <TabsTrigger value="finance">Finanzas</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
          </TabsList>

          <div className="h-full overflow-auto">
            <TabsContent value="overview" className="p-6 space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  <CasePhaseManager case_={case_} />
                  <CaseAlerts case_={case_} />
                </div>
                <div className="space-y-6">
                  <CaseMetrics case_={case_} />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="phases" className="p-6">
              <CasePhaseManager case_={case_} expanded />
            </TabsContent>

            <TabsContent value="tasks" className="p-6">
              <CaseTasksPanel case_={case_} />
            </TabsContent>

            <TabsContent value="time" className="p-6">
              <CaseTimeTracker case_={case_} />
            </TabsContent>

            <TabsContent value="documents" className="p-6">
              <CaseDocumentsHub case_={case_} />
            </TabsContent>

            <TabsContent value="finance" className="p-6">
              <CaseFinanceDashboard case_={case_} />
            </TabsContent>

            <TabsContent value="timeline" className="p-6">
              <CaseTimeline case_={case_} />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  )
}
