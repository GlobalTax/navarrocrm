import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Edit, Calendar, Mail, Phone, MapPin, User } from 'lucide-react'
import { CaseStatsPanel } from '../stats/CaseStatsPanel'
import { CaseTasksPanel } from '../tasks/CaseTasksPanel'
import { CaseTimeline } from '../timeline/CaseTimeline'
import { Case } from '@/features/cases'

interface CaseDetailDialogProps {
  case_: Case | null
  open: boolean
  onClose: () => void
  onEdit?: (case_: Case) => void
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'open': return 'bg-green-100 text-green-800 border-green-200'
    case 'closed': return 'bg-gray-100 text-gray-800 border-gray-200'
    case 'on_hold': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    default: return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'open': return 'Abierto'
    case 'closed': return 'Cerrado'
    case 'on_hold': return 'En espera'
    default: return status
  }
}

export function CaseDetailDialog({ case_, open, onClose, onEdit }: CaseDetailDialogProps) {
  if (!case_) return null

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <DialogTitle className="text-xl font-semibold">
                {case_.title}
              </DialogTitle>
              <Badge className={getStatusColor(case_.status)}>
                {getStatusLabel(case_.status)}
              </Badge>
            </div>
            {onEdit && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(case_)}
                className="flex items-center gap-2"
              >
                <Edit className="h-4 w-4" />
                Editar
              </Button>
            )}
          </div>
        </DialogHeader>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Resumen</TabsTrigger>
            <TabsTrigger value="tasks">Tareas</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="documents">Documentos</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Información del Expediente</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Descripción</label>
                    <p className="text-sm text-gray-900 mt-1">
                      {case_.description || 'Sin descripción'}
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Área Práctica</label>
                      <p className="text-sm text-gray-900 mt-1">
                        {case_.practice_area || 'Sin área'}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Método de Facturación</label>
                      <p className="text-sm text-gray-900 mt-1">
                        {case_.billing_method || 'No especificado'}
                      </p>
                    </div>
                  </div>

                  {case_.estimated_budget && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Presupuesto Estimado</label>
                      <p className="text-sm text-gray-900 mt-1">
                        €{case_.estimated_budget.toLocaleString()}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Información del Cliente
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Nombre</label>
                    <p className="text-sm text-gray-900 mt-1">
                      {(case_ as any).client?.name || 'Cliente no asignado'}
                    </p>
                  </div>
                  
                  {(case_ as any).client?.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-900">
                        {(case_ as any).client.email}
                      </span>
                    </div>
                  )}
                  
                  {(case_ as any).client?.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-900">
                        {(case_ as any).client.phone}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <CaseStatsPanel caseId={case_.id} />
          </TabsContent>

          <TabsContent value="tasks">
            <CaseTasksPanel caseId={case_.id} />
          </TabsContent>

          <TabsContent value="timeline">
            <CaseTimeline caseId={case_.id} />
          </TabsContent>

          <TabsContent value="documents">
            <Card>
              <CardHeader>
                <CardTitle>Documentos del Expediente</CardTitle>
                <CardDescription>
                  Gestión de documentos y archivos relacionados con este expediente
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <svg
                      className="w-12 h-12 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Gestión de Documentos
                  </h3>
                  <p className="text-gray-500">
                    La funcionalidad de documentos estará disponible próximamente.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}