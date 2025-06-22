
import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ProposalRecurringFeeButton } from './ProposalRecurringFeeButton'
import type { Proposal } from '@/types/proposals'
import { 
  MoreHorizontal, 
  Calendar, 
  User, 
  Clock, 
  Euro,
  CheckCircle,
  XCircle,
  FileText,
  Edit,
  Eye,
  Repeat
} from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface ProposalCardProps {
  proposal: Proposal
  onStatusChange: (id: string, status: string) => void
  onView: (proposal: Proposal) => void
}

export function ProposalCard({ proposal, onStatusChange, onView }: Propos




ardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800'
      case 'sent': return 'bg-blue-100 text-blue-800'
      case 'won': return 'bg-green-100 text-green-800'
      case 'lost': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'draft': return 'Borrador'
      case 'sent': return 'Enviada'
      case 'won': return 'Ganada'
      case 'lost': return 'Perdida'
      default: return status
    }
  }

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg mb-2 flex items-center gap-2">
              {proposal.is_recurring && <Repeat className="w-4 h-4 text-blue-500" />}
              {proposal.title}
            </CardTitle>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <User className="w-3 h-3" />
                {proposal.client?.name}
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {format(new Date(proposal.created_at), 'dd/MM/yyyy', { locale: es })}
              </div>
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Acciones</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => onView(proposal)}>
                <Eye className="w-4 h-4 mr-2" />
                Ver detalles
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Edit className="w-4 h-4 mr-2" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Cambiar estado</DropdownMenuLabel>
              {proposal.status !== 'won' && (
                <DropdownMenuItem 
                  onClick={() => onStatusChange(proposal.id, 'won')}
                  className="text-green-600"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Marcar como ganada
                </DropdownMenuItem>
              )}
              {proposal.status !== 'lost' && (
                <DropdownMenuItem 
                  onClick={() => onStatusChange(proposal.id, 'lost')}
                  className="text-red-600"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Marcar como perdida
                </DropdownMenuItem>
              )}
              {proposal.status !== 'sent' && proposal.status !== 'won' && proposal.status !== 'lost' && (
                <DropdownMenuItem onClick={() => onStatusChange(proposal.id, 'sent')}>
                  <FileText className="w-4 h-4 mr-2" />
                  Marcar como enviada
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Información principal */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Importe total</p>
            <p className="text-xl font-bold text-green-600">
              {proposal.total_amount?.toFixed(2)} €
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Estado</p>
            <Badge className={getStatusColor(proposal.status)}>
              {getStatusText(proposal.status)}
            </Badge>
          </div>
        </div>

        {/* Información de recurrencia */}
        {proposal.is_recurring && (
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
            <p className="text-sm font-medium text-blue-900 mb-1">Propuesta Recurrente</p>
            <div className="grid grid-cols-2 gap-2 text-xs text-blue-700">
              {proposal.recurring_frequency && (
                <div>
                  <span>Frecuencia: </span>
                  <span className="font-medium">
                    {proposal.recurring_frequency === 'monthly' ? 'Mensual' :
                     proposal.recurring_frequency === 'quarterly' ? 'Trimestral' :
                     proposal.recurring_frequency === 'yearly' ? 'Anual' : proposal.recurring_frequency}
                  </span>
                </div>
              )}
              {proposal.retainer_amount > 0 && (
                <div>
                  <span>Retainer: </span>
                  <span className="font-medium">{proposal.retainer_amount.toFixed(2)} €</span>
                </div>
              )}
              {proposal.included_hours > 0 && (
                <div>
                  <span>Horas: </span>
                  <span className="font-medium">{proposal.included_hours}h</span>
                </div>
              )}
              {proposal.contract_start_date && (
                <div>
                  <span>Inicio: </span>
                  <span className="font-medium">
                    {format(new Date(proposal.contract_start_date), 'dd/MM/yyyy', { locale: es })}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Fechas importantes */}
        {(proposal.valid_until || proposal.sent_at || proposal.accepted_at) && (
          <div className="space-y-2">
            {proposal.valid_until && (
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-3 h-3 text-muted-foreground" />
                <span className="text-muted-foreground">
                  Válida hasta: {format(new Date(proposal.valid_until), 'dd/MM/yyyy', { locale: es })}
                </span>
              </div>
            )}
            {proposal.sent_at && (
              <div className="flex items-center gap-2 text-sm">
                <FileText className="w-3 h-3 text-blue-500" />
                <span className="text-blue-600">
                  Enviada: {format(new Date(proposal.sent_at), 'dd/MM/yyyy', { locale: es })}
                </span>
              </div>
            )}
            {proposal.accepted_at && (
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="w-3 h-3 text-green-500" />
                <span className="text-green-600">
                  Aceptada: {format(new Date(proposal.accepted_at), 'dd/MM/yyyy', { locale: es })}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Descripción */}
        {proposal.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {proposal.description}
          </p>
        )}

        {/* Botón para crear cuota recurrente */}
        {proposal.is_recurring && proposal.status === 'won' && (
          <ProposalRecurringFeeButton proposal={proposal} />
        )}
      </CardContent>
    </Card>
  )
}
