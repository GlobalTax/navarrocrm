
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { MoreHorizontal, Eye, Send, Check, X, Clock, Repeat, Calendar } from 'lucide-react'
import { Proposal } from '@/hooks/useProposals'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface ProposalCardProps {
  proposal: Proposal
  onStatusChange: (id: string, status: Proposal['status']) => void
  onView: (proposal: Proposal) => void
}

const statusConfig = {
  draft: { 
    label: 'Borrador', 
    color: 'bg-gray-500 text-white',
    icon: Clock
  },
  sent: { 
    label: 'Enviada', 
    color: 'bg-blue-500 text-white',
    icon: Send
  },
  negotiating: { 
    label: 'Negociando', 
    color: 'bg-yellow-500 text-white',
    icon: Clock
  },
  won: { 
    label: 'Ganada', 
    color: 'bg-green-500 text-white',
    icon: Check
  },
  lost: { 
    label: 'Perdida', 
    color: 'bg-red-500 text-white',
    icon: X
  },
  expired: { 
    label: 'Expirada', 
    color: 'bg-gray-600 text-white',
    icon: Clock
  }
}

const frequencyLabels = {
  monthly: 'Mensual',
  quarterly: 'Trimestral',
  yearly: 'Anual'
}

export function ProposalCard({ proposal, onStatusChange, onView }: ProposalCardProps) {
  const config = statusConfig[proposal.status]
  const StatusIcon = config.icon

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-lg leading-none">{proposal.title}</h3>
              {proposal.is_recurring && (
                <Badge variant="outline" className="text-xs">
                  <Repeat className="h-3 w-3 mr-1" />
                  {proposal.recurring_frequency && frequencyLabels[proposal.recurring_frequency]}
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              {proposal.client?.name}
            </p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onView(proposal)}>
                <Eye className="h-4 w-4 mr-2" />
                Ver detalles
              </DropdownMenuItem>
              {proposal.status === 'draft' && (
                <DropdownMenuItem onClick={() => onStatusChange(proposal.id, 'sent')}>
                  <Send className="h-4 w-4 mr-2" />
                  Enviar
                </DropdownMenuItem>
              )}
              {(proposal.status === 'sent' || proposal.status === 'negotiating') && (
                <>
                  <DropdownMenuItem onClick={() => onStatusChange(proposal.id, 'won')}>
                    <Check className="h-4 w-4 mr-2" />
                    Marcar como ganada
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onStatusChange(proposal.id, 'lost')}>
                    <X className="h-4 w-4 mr-2" />
                    Marcar como perdida
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      
      <CardContent className="py-3">
        <div className="flex items-center justify-between mb-3">
          <Badge className={config.color}>
            <StatusIcon className="h-3 w-3 mr-1" />
            {config.label}
          </Badge>
          <span className="font-semibold text-lg">
            €{proposal.total_amount.toLocaleString()}
            {proposal.is_recurring && proposal.recurring_frequency && (
              <span className="text-xs text-muted-foreground ml-1">
                /{proposal.recurring_frequency === 'monthly' ? 'mes' : 
                  proposal.recurring_frequency === 'quarterly' ? 'trim' : 'año'}
              </span>
            )}
          </span>
        </div>
        
        {proposal.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {proposal.description}
          </p>
        )}
        
        <div className="text-xs text-muted-foreground space-y-1">
          <div>Creada: {format(new Date(proposal.created_at), 'dd MMM yyyy', { locale: es })}</div>
          {proposal.sent_at && (
            <div>Enviada: {format(new Date(proposal.sent_at), 'dd MMM yyyy', { locale: es })}</div>
          )}
          {proposal.valid_until && (
            <div>Válida hasta: {format(new Date(proposal.valid_until), 'dd MMM yyyy', { locale: es })}</div>
          )}
          {proposal.is_recurring && proposal.contract_start_date && (
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Inicio: {format(new Date(proposal.contract_start_date), 'dd MMM yyyy', { locale: es })}
            </div>
          )}
          {proposal.is_recurring && proposal.next_billing_date && (
            <div className="flex items-center gap-1 text-blue-600">
              <Calendar className="h-3 w-3" />
              Próxima factura: {format(new Date(proposal.next_billing_date), 'dd MMM yyyy', { locale: es })}
            </div>
          )}
        </div>

        {proposal.proposal_type === 'retainer' && proposal.retainer_amount && (
          <div className="mt-2 text-xs bg-blue-50 p-2 rounded">
            <div className="font-medium">Retainer: €{proposal.retainer_amount.toLocaleString()}</div>
            {proposal.included_hours && (
              <div>Incluye {proposal.included_hours}h • Extra: €{proposal.hourly_rate_extra || 0}/h</div>
            )}
          </div>
        )}
      </CardContent>
      
      <CardFooter className="pt-3">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => onView(proposal)}
          className="w-full"
        >
          Ver propuesta
        </Button>
      </CardFooter>
    </Card>
  )
}
