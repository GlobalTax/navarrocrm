
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { MoreHorizontal, Eye, Send, Check, X, Clock } from 'lucide-react'
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

export function ProposalCard({ proposal, onStatusChange, onView }: ProposalCardProps) {
  const config = statusConfig[proposal.status]
  const StatusIcon = config.icon

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h3 className="font-semibold text-lg leading-none">{proposal.title}</h3>
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
        </div>
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
