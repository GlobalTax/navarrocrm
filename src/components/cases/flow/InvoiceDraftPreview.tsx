import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Receipt, 
  Clock, 
  Euro, 
  FileText, 
  AlertCircle, 
  CheckCircle,
  Calendar
} from 'lucide-react'
import { Case } from '@/features/cases'
import { CaseFlowStatus } from '@/hooks/useCaseFlow'
import { UnbilledTimeEntry } from '@/hooks/useUnbilledTime'

interface InvoiceDraftPreviewProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  case_: Case
  unbilledEntries: UnbilledTimeEntry[]
  flowStatus: CaseFlowStatus
}

export const InvoiceDraftPreview = ({ 
  open, 
  onOpenChange, 
  case_, 
  unbilledEntries, 
  flowStatus 
}: InvoiceDraftPreviewProps) => {

  const groupedEntries = unbilledEntries.reduce((acc, entry) => {
    const date = new Date(entry.created_at).toDateString()
    if (!acc[date]) {
      acc[date] = []
    }
    acc[date].push(entry)
    return acc
  }, {} as Record<string, UnbilledTimeEntry[]>)

  const totalHours = flowStatus.unbilledHours
  // Use estimated_budget if available or default hourly rate
  const defaultRate = 150 
  const hourlyRate = defaultRate // For now, use default rate since hourly_rate structure varies
  const estimatedAmount = totalHours * hourlyRate

  const handleCreateInvoice = () => {
    // Redirigir a creación de factura con datos precargados
    const entryIds = unbilledEntries.map(e => e.id).join(',')
    window.location.href = `/invoices/new?case_id=${case_.id}&time_entries=${entryIds}`
  }

  const canCreateInvoice = unbilledEntries.length > 0 && flowStatus.hasAcceptedProposal

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Borrador de Factura - {case_.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Resumen */}
          <Card className="border-[0.5px] border-black rounded-[10px]">
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-blue-500" />
                  <div>
                    <div className="text-sm text-muted-foreground">Horas sin facturar</div>
                    <div className="text-lg font-semibold">{totalHours}h</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Euro className="h-5 w-5 text-green-500" />
                  <div>
                    <div className="text-sm text-muted-foreground">Tarifa por hora</div>
                    <div className="text-lg font-semibold">€{hourlyRate}</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-purple-500" />
                  <div>
                    <div className="text-sm text-muted-foreground">Total estimado</div>
                    <div className="text-lg font-semibold">€{estimatedAmount.toFixed(2)}</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Estado de facturación */}
          <Card className="border-[0.5px] border-gray-300 rounded-[10px]">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                {canCreateInvoice ? (
                  <>
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <div>
                      <div className="font-medium text-green-700">Listo para facturar</div>
                      <div className="text-sm text-muted-foreground">
                        Propuesta aceptada y tiempo registrado disponible
                      </div>
                    </div>
                  </>
                ) : !flowStatus.hasAcceptedProposal ? (
                  <>
                    <AlertCircle className="h-5 w-5 text-orange-500" />
                    <div>
                      <div className="font-medium text-orange-700">Propuesta pendiente</div>
                      <div className="text-sm text-muted-foreground">
                        Necesitas una propuesta aceptada para facturar
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-5 w-5 text-blue-500" />
                    <div>
                      <div className="font-medium text-blue-700">Sin tiempo sin facturar</div>
                      <div className="text-sm text-muted-foreground">
                        Registra tiempo de trabajo para generar facturas
                      </div>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Desglose de tiempo por día */}
          {unbilledEntries.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-medium">Tiempo sin facturar</h3>
              <div className="space-y-2">
                {Object.entries(groupedEntries).map(([date, entries]) => {
                  const dayTotal = entries.reduce((sum, entry) => sum + entry.duration_minutes, 0) / 60
                  return (
                    <Card key={date} className="border-[0.5px] border-gray-200 rounded-[10px]">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span className="font-medium">
                              {new Date(date).toLocaleDateString('es-ES', { 
                                weekday: 'long', 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric' 
                              })}
                            </span>
                          </div>
                          <Badge variant="outline" className="border-[0.5px] rounded-[10px]">
                            {dayTotal.toFixed(2)}h
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="space-y-2">
                          {entries.map((entry) => (
                            <div key={entry.id} className="flex justify-between items-start text-sm">
                              <div className="flex-1">
                                <div className="font-medium">
                                  {entry.description || 'Sin descripción'}
                                </div>
                                <div className="text-muted-foreground">
                                  {entry.entry_type}
                                </div>
                              </div>
                              <div className="text-right">
                                <div>{(entry.duration_minutes / 60).toFixed(2)}h</div>
                                <div className="text-muted-foreground">
                                  €{((entry.duration_minutes / 60) * hourlyRate).toFixed(2)}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>
          )}

          {/* Sugerencias */}
          <Card className="bg-blue-50 border-blue-200 rounded-[10px]">
            <CardContent className="p-4">
              <h4 className="font-medium text-blue-900 mb-2">💡 Siguiente paso</h4>
              <div className="text-sm text-blue-800">
                {canCreateInvoice ? (
                  <p>Haz clic en "Crear Factura" para generar una factura con el tiempo registrado.</p>
                ) : !flowStatus.hasAcceptedProposal ? (
                  <p>Primero necesitas una propuesta aceptada. Ve a la pestaña "Propuesta" para crear o revisar propuestas.</p>
                ) : (
                  <p>Registra tiempo de trabajo en este expediente para poder crear facturas.</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Acciones */}
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cerrar
            </Button>
            <Button
              onClick={handleCreateInvoice}
              disabled={!canCreateInvoice}
              className="flex items-center gap-2"
            >
              <Receipt className="h-4 w-4" />
              Crear Factura
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}