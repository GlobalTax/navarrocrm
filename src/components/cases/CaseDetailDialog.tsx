
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Edit, BarChart3, Clock, CheckSquare } from 'lucide-react'
import { Case } from '@/features/cases'
import { CaseStatsPanel } from './stats/CaseStatsPanel'
import { CaseTimeline } from './timeline/CaseTimeline'
import { CaseTasksPanel } from './tasks/CaseTasksPanel'

interface CaseDetailDialogProps {
  case_: Case | null
  open: boolean
  onClose: () => void
  onEdit?: (case_: Case) => void
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'open':
      return 'bg-blue-100 text-blue-800'
    case 'on_hold':
      return 'bg-yellow-100 text-yellow-800'
    case 'closed':
      return 'bg-green-100 text-green-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'open':
      return 'Abierto'
    case 'on_hold':
      return 'En Espera'
    case 'closed':
      return 'Cerrado'
    default:
      return status
  }
}

export const CaseDetailDialog = ({ case_, open, onClose, onEdit }: CaseDetailDialogProps) => {
  if (!case_) return null

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-xl">{case_.title}</span>
              <Badge variant="outline" className={getStatusColor(case_.status)}>
                {getStatusLabel(case_.status)}
              </Badge>
            </div>
            {onEdit && (
              <Button variant="outline" size="sm" onClick={() => onEdit(case_)}>
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </Button>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <Tabs defaultValue="overview" className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-4 flex-shrink-0">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Resumen
              </TabsTrigger>
              <TabsTrigger value="tasks" className="flex items-center gap-2">
                <CheckSquare className="h-4 w-4" />
                Tareas
              </TabsTrigger>
              <TabsTrigger value="timeline" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Timeline
              </TabsTrigger>
              <TabsTrigger value="documents" className="flex items-center gap-2">
                Documentos
              </TabsTrigger>
            </TabsList>
            
            <div className="flex-1 overflow-y-auto mt-4">
              <TabsContent value="overview" className="space-y-6 mt-0">
                {/* Información básica */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Información del Expediente</h3>
                      <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                        <div>
                          <span className="font-medium text-gray-700">Título:</span>
                          <span className="ml-2">{case_.title}</span>
                        </div>
                        {case_.description && (
                          <div>
                            <span className="font-medium text-gray-700">Descripción:</span>
                            <p className="mt-1 text-gray-600">{case_.description}</p>
                          </div>
                        )}
                        <div>
                          <span className="font-medium text-gray-700">Área de práctica:</span>
                          <span className="ml-2">{case_.practice_area || 'No especificada'}</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Método de facturación:</span>
                          <span className="ml-2">{case_.billing_method === 'hourly' ? 'Por horas' : case_.billing_method}</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Creado:</span>
                          <span className="ml-2">{new Date(case_.created_at).toLocaleDateString('es-ES')}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Cliente</h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      {case_.contact ? (
                        <div className="space-y-2">
                          <div className="font-medium">{case_.contact.name}</div>
                          {case_.contact.email && (
                            <div className="text-sm text-gray-600">{case_.contact.email}</div>
                          )}
                          {case_.contact.phone && (
                            <div className="text-sm text-gray-600">{case_.contact.phone}</div>
                          )}
                        </div>
                      ) : (
                        <div className="text-gray-500">Sin cliente asignado</div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Estadísticas del expediente */}
                <CaseStatsPanel caseId={case_.id} />
              </TabsContent>
              
              <TabsContent value="tasks" className="mt-0">
                <CaseTasksPanel caseId={case_.id} />
              </TabsContent>
              
              <TabsContent value="timeline" className="mt-0">
                <CaseTimeline caseId={case_.id} />
              </TabsContent>
              
              <TabsContent value="documents" className="mt-0">
                <div className="text-center py-12 text-gray-500">
                  <div className="text-lg font-medium mb-2">Gestión de Documentos</div>
                  <p className="text-sm">Esta funcionalidad estará disponible próximamente</p>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  )
}
