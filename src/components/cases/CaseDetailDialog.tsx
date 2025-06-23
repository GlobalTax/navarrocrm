
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Calendar, User, Edit, Clock, FileText } from 'lucide-react'
import { Case } from '@/hooks/useCases'

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
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span>Detalle del Caso</span>
              <Badge className={getStatusColor(case_.status)}>
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

        <div className="space-y-6">
          {/* Información principal */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div>
                  <h2 className="text-2xl font-bold">{case_.title}</h2>
                  {case_.description && (
                    <p className="text-gray-600 mt-2">{case_.description}</p>
                  )}
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-400" />
                    <div>
                      <span className="font-medium">Cliente:</span>
                      <span className="ml-2">Contacto no disponible</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <div>
                      <span className="font-medium">Creado:</span>
                      <span className="ml-2">{new Date(case_.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {case_.updated_at && (
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <div>
                        <span className="font-medium">Actualizado:</span>
                        <span className="ml-2">{new Date(case_.updated_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Estadísticas rápidas */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">0</div>
                <div className="text-sm text-gray-600">Tareas</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">0h</div>
                <div className="text-sm text-gray-600">Tiempo</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-orange-600">0</div>
                <div className="text-sm text-gray-600">Documentos</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-purple-600">0€</div>
                <div className="text-sm text-gray-600">Facturado</div>
              </CardContent>
            </Card>
          </div>

          {/* Próximas funcionalidades */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Actividad Reciente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <p>No hay actividad registrada para este caso</p>
                <p className="text-sm mt-2">Las tareas, documentos y registros de tiempo aparecerán aquí</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}
