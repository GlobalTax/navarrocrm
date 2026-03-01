
import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu'
import { type RecurringFee } from '@/hooks/useRecurringFees'
import type { RecurringFeeHoursData } from '@/hooks/recurringFees/useRecurringFeeTimeEntries'
import { 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Play, 
  Pause, 
  FileText, 
  Clock,
  AlertTriangle,
  CheckCircle,
  Euro
} from 'lucide-react'
import { format, isAfter, isBefore } from 'date-fns'
import { es } from 'date-fns/locale'

interface RecurringFeeCardProps {
  recurringFee: RecurringFee
  hoursData?: RecurringFeeHoursData
  onEdit: (fee: RecurringFee) => void
  onDelete: (fee: RecurringFee) => void
  onToggleStatus: (fee: RecurringFee) => void
  onViewDetails: (fee: RecurringFee) => void
  onGenerateInvoice?: (fee: RecurringFee) => void
}

export function RecurringFeeCard({
  recurringFee,
  hoursData,
  onEdit,
  onDelete,
  onToggleStatus,
  onViewDetails,
  onGenerateInvoice
}: RecurringFeeCardProps) {
  const isOverdue = isAfter(new Date(), new Date(recurringFee.next_billing_date))
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'paused': return 'bg-yellow-100 text-yellow-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      case 'completed': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getFrequencyText = (frequency: string) => {
    switch (frequency) {
      case 'monthly': return 'Mensual'
      case 'quarterly': return 'Trimestral'
      case 'yearly': return 'Anual'
      default: return frequency
    }
  }

  const StatusIcon = recurringFee.status === 'active' ? CheckCircle : 
                    recurringFee.status === 'paused' ? Pause :
                    recurringFee.status === 'cancelled' ? Trash2 : Clock

  return (
    <Card className={`hover:shadow-lg transition-shadow ${
      isOverdue && recurringFee.status === 'active' ? 'border-red-300 bg-red-50' : ''
    }`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg mb-2 flex items-center gap-2">
              <StatusIcon className="w-4 h-4" />
              {recurringFee.name}
              {isOverdue && recurringFee.status === 'active' && (
                <AlertTriangle className="w-4 h-4 text-red-500" />
              )}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Cliente: <span className="font-medium">{recurringFee.client?.name}</span>
            </p>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onViewDetails(recurringFee)}>
                <FileText className="w-4 h-4 mr-2" />
                Ver detalles
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(recurringFee)}>
                <Edit className="w-4 h-4 mr-2" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onToggleStatus(recurringFee)}>
                {recurringFee.status === 'active' ? (
                  <>
                    <Pause className="w-4 h-4 mr-2" />
                    Pausar
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Activar
                  </>
                )}
              </DropdownMenuItem>
              {onGenerateInvoice && recurringFee.status === 'active' && (
                <DropdownMenuItem onClick={() => onGenerateInvoice(recurringFee)}>
                  <Euro className="w-4 h-4 mr-2" />
                  Generar factura
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => onDelete(recurringFee)}
                className="text-red-600"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Información principal */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Importe</p>
            <p className="text-xl font-bold text-green-600">
              {recurringFee.amount.toFixed(2)} €
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Frecuencia</p>
            <p className="font-medium">{getFrequencyText(recurringFee.frequency)}</p>
          </div>
        </div>

        {/* Información de horas si aplica */}
        {recurringFee.included_hours > 0 && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Horas incluidas</p>
                <p className="font-medium">{recurringFee.included_hours}h</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tarifa extra</p>
                <p className="font-medium">{recurringFee.hourly_rate_extra.toFixed(2)} €/h</p>
              </div>
            </div>

            {/* Barra de consumo de horas */}
            {hoursData && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Consumo periodo</span>
                  <span className={`font-medium ${hoursData.utilizationPercent > 100 ? 'text-red-600' : hoursData.utilizationPercent > 80 ? 'text-amber-600' : 'text-green-600'}`}>
                    {hoursData.hoursUsed}h / {hoursData.includedHours}h ({hoursData.utilizationPercent}%)
                  </span>
                </div>
                <Progress 
                  value={Math.min(hoursData.utilizationPercent, 100)} 
                  className={`h-2 ${hoursData.utilizationPercent > 100 ? '[&>div]:bg-red-500' : hoursData.utilizationPercent > 80 ? '[&>div]:bg-amber-500' : '[&>div]:bg-green-500'}`}
                />
                {hoursData.extraHours > 0 && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-red-600 font-medium flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      {hoursData.extraHours}h extra
                    </span>
                    <span className="text-red-600 font-bold">
                      +{hoursData.extraAmount.toFixed(2)} €
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Próxima facturación */}
        <div>
          <p className="text-sm text-muted-foreground">Próxima facturación</p>
          <p className={`font-medium ${isOverdue ? 'text-red-600' : ''}`}>
            {format(new Date(recurringFee.next_billing_date), 'dd/MM/yyyy', { locale: es })}
            {isOverdue && ' (Vencida)'}
          </p>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-2">
          <Badge className={getStatusColor(recurringFee.status)}>
            {recurringFee.status.charAt(0).toUpperCase() + recurringFee.status.slice(1)}
          </Badge>
          <Badge className={getPriorityColor(recurringFee.priority)}>
            Prioridad {recurringFee.priority}
          </Badge>
          {recurringFee.proposal_id && (
            <Badge className="bg-blue-100 text-blue-800">
              <FileText className="w-3 h-3 mr-1" />
              Automática
            </Badge>
          )}
          {recurringFee.auto_invoice && (
            <Badge variant="outline">
              Auto-facturación
            </Badge>
          )}
        </div>

        {/* Información de propuesta asociada */}
        {recurringFee.proposal && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center gap-2 text-blue-700 mb-1">
              <FileText className="w-3 h-3" />
              <span className="text-xs font-medium">Propuesta:</span>
            </div>
            <div className="text-xs text-blue-600">
              <p className="font-medium">{recurringFee.proposal.title}</p>
              <p>#{recurringFee.proposal.proposal_number}</p>
            </div>
          </div>
        )}

        {/* Etiquetas */}
        {recurringFee.tags && recurringFee.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {recurringFee.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
            {recurringFee.tags.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{recurringFee.tags.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* Descripción */}
        {recurringFee.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {recurringFee.description}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
