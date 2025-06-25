
import React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import type { Proposal } from '@/types/proposals'
import { 
  Calendar, 
  User, 
  Euro, 
  FileText, 
  Repeat, 
  Clock,
  CheckCircle,
  Building,
  Phone,
  Mail
} from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface ProposalDetailDialogProps {
  proposal: Proposal | null
  open: boolean
  onClose: () => void
}

export const ProposalDetailDialog = ({ proposal, open, onClose }: ProposalDetailDialogProps) => {
  if (!proposal) return null

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800'
      case 'sent': return 'bg-blue-100 text-blue-800'
      case 'negotiating': return 'bg-yellow-100 text-yellow-800'
      case 'won': return 'bg-green-100 text-green-800'
      case 'lost': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'draft': return 'Borrador'
      case 'sent': return 'Enviada'
      case 'negotiating': return 'Negociando'
      case 'won': return 'Ganada'
      case 'lost': return 'Perdida'
      default: return status
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            {proposal.is_recurring ? (
              <Repeat className="h-5 w-5 text-blue-600" />
            ) : (
              <FileText className="h-5 w-5 text-green-600" />
            )}
            {proposal.title}
            <Badge className={getStatusColor(proposal.status)}>
              {getStatusText(proposal.status)}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-6">
          {/* Información básica */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-4 w-4" />
                Información General
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Cliente</p>
                  <p className="font-medium">{proposal.client?.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Número de Propuesta</p>
                  <p className="font-medium">{proposal.proposal_number || 'Sin asignar'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Tipo</p>
                  <Badge variant="outline">
                    {proposal.is_recurring ? 'Recurrente' : 'Puntual'}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Importe Total</p>
                  <p className="text-lg font-bold text-green-600">
                    €{proposal.total_amount?.toFixed(2) || '0.00'}
                  </p>
                </div>
              </div>

              {proposal.description && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Descripción</p>
                  <p className="text-sm">{proposal.description}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Información de recurrencia */}
          {proposal.is_recurring && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Repeat className="h-4 w-4" />
                  Configuración Recurrente
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Frecuencia</p>
                    <p className="font-medium">
                      {proposal.recurring_frequency === 'monthly' ? 'Mensual' :
                       proposal.recurring_frequency === 'quarterly' ? 'Trimestral' :
                       proposal.recurring_frequency === 'yearly' ? 'Anual' : 
                       proposal.recurring_frequency || 'No especificada'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Retainer</p>
                    <p className="font-medium">€{proposal.retainer_amount?.toFixed(2) || '0.00'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Horas Incluidas</p>
                    <p className="font-medium">{proposal.included_hours || 0}h</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Tarifa Extra</p>
                    <p className="font-medium">€{proposal.hourly_rate_extra?.toFixed(2) || '0.00'}/h</p>
                  </div>
                  {proposal.contract_start_date && (
                    <div>
                      <p className="text-sm text-muted-foreground">Inicio Contrato</p>
                      <p className="font-medium">
                        {format(new Date(proposal.contract_start_date), 'dd/MM/yyyy', { locale: es })}
                      </p>
                    </div>
                  )}
                  {proposal.contract_end_date && (
                    <div>
                      <p className="text-sm text-muted-foreground">Fin Contrato</p>
                      <p className="font-medium">
                        {format(new Date(proposal.contract_end_date), 'dd/MM/yyyy', { locale: es })}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Fechas importantes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Fechas Importantes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Creada</p>
                  <p className="font-medium">
                    {format(new Date(proposal.created_at), 'dd/MM/yyyy HH:mm', { locale: es })}
                  </p>
                </div>
                {proposal.sent_at && (
                  <div>
                    <p className="text-sm text-muted-foreground">Enviada</p>
                    <p className="font-medium">
                      {format(new Date(proposal.sent_at), 'dd/MM/yyyy HH:mm', { locale: es })}
                    </p>
                  </div>
                )}
                {proposal.accepted_at && (
                  <div>
                    <p className="text-sm text-muted-foreground">Aceptada</p>
                    <p className="font-medium">
                      {format(new Date(proposal.accepted_at), 'dd/MM/yyyy HH:mm', { locale: es })}
                    </p>
                  </div>
                )}
                {proposal.valid_until && (
                  <div>
                    <p className="text-sm text-muted-foreground">Válida hasta</p>
                    <p className="font-medium">
                      {format(new Date(proposal.valid_until), 'dd/MM/yyyy', { locale: es })}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Contenido detallado */}
          {(proposal.introduction || proposal.scope_of_work || proposal.timeline) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Contenido Detallado
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {proposal.introduction && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">Introducción</p>
                    <p className="text-sm">{proposal.introduction}</p>
                  </div>
                )}
                {proposal.scope_of_work && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">Alcance del Trabajo</p>
                    <p className="text-sm">{proposal.scope_of_work}</p>
                  </div>
                )}
                {proposal.timeline && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">Cronograma</p>
                    <p className="text-sm">{proposal.timeline}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Líneas de servicio */}
          {proposal.line_items && proposal.line_items.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Servicios Incluidos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {proposal.line_items.map((item, index) => (
                    <div key={item.id || index} className="flex justify-between items-center p-3 border rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium">{item.name}</p>
                        {item.description && (
                          <p className="text-sm text-muted-foreground">{item.description}</p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          {item.quantity} × €{item.unit_price.toFixed(2)} por {item.billing_unit}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">€{item.total_price.toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Notas */}
          {proposal.notes && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Notas Internas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{proposal.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
