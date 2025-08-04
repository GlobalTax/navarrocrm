
import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { 
  User, 
  Calendar, 
  Euro, 
  Clock, 
  FileText, 
  Repeat,
  Building,
  Mail,
  Phone
} from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { getStatusColor, getStatusLabel, getFrequencyLabel, formatCurrency, formatDate } from './utils/proposalFormatters'
import { useRecurringFees } from '@/features/billing'

interface ProposalDetailDialogProps {
  proposal: any
  isOpen: boolean
  onClose: () => void
  onEdit: (proposal: any) => void
  onDuplicate: (proposal: any) => void
  onStatusChange: (id: string, status: string) => void
}

export const ProposalDetailDialog = ({
  proposal,
  isOpen,
  onClose,
  onEdit,
  onDuplicate,
  onStatusChange
}: ProposalDetailDialogProps) => {
  if (!proposal) return null

  // Obtener cuota recurrente asociada si existe
  const { data: recurringFees = [] } = useRecurringFees()
  const associatedFee = recurringFees.find(fee => fee.proposal_id === proposal.id)

  const handleStatusChange = (newStatus: string) => {
    onStatusChange(proposal.id, newStatus)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              {proposal.is_recurring ? (
                <Repeat className="h-5 w-5 text-blue-600" />
              ) : (
                <FileText className="h-5 w-5 text-green-600" />
              )}
              {proposal.title}
            </div>
            <Badge className={getStatusColor(proposal.status)}>
              {getStatusLabel(proposal.status)}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Información principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Información básica */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Información General
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Número de Propuesta</label>
                  <p className="text-sm">{proposal.proposal_number || 'No asignado'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Tipo</label>
                  <p className="text-sm">
                    {proposal.is_recurring ? 'Recurrente' : 'Puntual'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Importe Total</label>
                  <p className="text-lg font-bold text-green-600">
                    {formatCurrency(proposal.total_amount)}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Moneda</label>
                  <p className="text-sm">{proposal.currency || 'EUR'}</p>
                </div>
              </div>

              {proposal.description && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Descripción</label>
                  <p className="text-sm mt-1 p-3 bg-gray-50 rounded-lg">{proposal.description}</p>
                </div>
              )}
            </div>

            <Separator />

            {/* Información recurrente */}
            {proposal.is_recurring && (
              <>
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    <Repeat className="h-4 w-4 text-blue-600" />
                    Configuración Recurrente
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Frecuencia</label>
                      <p className="text-sm">{getFrequencyLabel(proposal.recurring_frequency)}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Día de facturación</label>
                      <p className="text-sm">{proposal.billing_day || 'No definido'}</p>
                    </div>
                    {proposal.retainer_amount > 0 && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Retainer</label>
                        <p className="text-sm font-semibold">{formatCurrency(proposal.retainer_amount)}</p>
                      </div>
                    )}
                    {proposal.included_hours > 0 && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Horas incluidas</label>
                        <p className="text-sm">{proposal.included_hours}h</p>
                      </div>
                    )}
                    {proposal.hourly_rate_extra > 0 && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Tarifa extra/hora</label>
                        <p className="text-sm">{formatCurrency(proposal.hourly_rate_extra)}</p>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Fecha inicio</label>
                      <p className="text-sm">{formatDate(proposal.contract_start_date)}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Fecha fin</label>
                      <p className="text-sm">{formatDate(proposal.contract_end_date)}</p>
                    </div>
                    {proposal.next_billing_date && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Próxima facturación</label>
                        <p className="text-sm">{formatDate(proposal.next_billing_date)}</p>
                      </div>
                    )}
                    <div>
                      <label className="text-sm font-medium text-gray-500">Auto-renovación</label>
                      <p className="text-sm">{proposal.auto_renewal ? 'Sí' : 'No'}</p>
                    </div>
                  </div>
                </div>
                <Separator />
              </>
            )}

            {/* Fechas importantes */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Fechas Importantes
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Creada</label>
                  <p className="text-sm">{formatDate(proposal.created_at)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Actualizada</label>
                  <p className="text-sm">{formatDate(proposal.updated_at)}</p>
                </div>
                {proposal.valid_until && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Válida hasta</label>
                    <p className="text-sm">{formatDate(proposal.valid_until)}</p>
                  </div>
                )}
                {proposal.sent_at && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Enviada</label>
                    <p className="text-sm">{formatDate(proposal.sent_at)}</p>
                  </div>
                )}
                {proposal.accepted_at && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Aceptada</label>
                    <p className="text-sm">{formatDate(proposal.accepted_at)}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Panel lateral */}
          <div className="space-y-6">
            {/* Información del cliente */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <User className="h-4 w-4" />
                Cliente
              </h3>
              
              {proposal.client ? (
                <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-gray-600" />
                    <span className="font-medium">{proposal.client.name}</span>
                  </div>
                  {proposal.client.email && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail className="h-3 w-3" />
                      <span>{proposal.client.email}</span>
                    </div>
                  )}
                  {proposal.client.phone && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="h-3 w-3" />
                      <span>{proposal.client.phone}</span>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-gray-500">Sin cliente asignado</p>
              )}
            </div>

            {/* Acciones rápidas */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Acciones</h3>
              
              <div className="space-y-2">
                <Button 
                  onClick={() => onEdit(proposal)} 
                  className="w-full justify-start"
                  variant="outline"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Editar Propuesta
                </Button>
                
                <Button 
                  onClick={() => onDuplicate(proposal)} 
                  className="w-full justify-start"
                  variant="outline"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Duplicar Propuesta
                </Button>

                {/* Mostrar cuota recurrente asociada */}
                {associatedFee && (
                  <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2 text-green-700 mb-2">
                      <Euro className="h-4 w-4" />
                      <span className="font-medium text-sm">Cuota Recurrente Activa</span>
                    </div>
                    <div className="text-sm text-green-600">
                      <p className="font-medium">{associatedFee.name}</p>
                      <p className="text-xs">
                        €{associatedFee.amount} • {associatedFee.frequency} • {associatedFee.status}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Cambios de estado */}
              <div className="space-y-2">
                <h4 className="font-medium text-sm text-gray-700">Cambiar Estado</h4>
                
                {proposal.status !== 'sent' && proposal.status !== 'won' && proposal.status !== 'lost' && (
                  <Button 
                    onClick={() => handleStatusChange('sent')} 
                    variant="outline" 
                    size="sm" 
                    className="w-full justify-start text-blue-600 hover:text-blue-700"
                  >
                    Marcar como Enviada
                  </Button>
                )}
                
                {proposal.status !== 'won' && (
                  <Button 
                    onClick={() => handleStatusChange('won')} 
                    variant="outline" 
                    size="sm" 
                    className="w-full justify-start text-green-600 hover:text-green-700"
                  >
                    Marcar como Ganada
                  </Button>
                )}
                
                {proposal.status !== 'lost' && (
                  <Button 
                    onClick={() => handleStatusChange('lost')} 
                    variant="outline" 
                    size="sm" 
                    className="w-full justify-start text-red-600 hover:text-red-700"
                  >
                    Marcar como Perdida
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
