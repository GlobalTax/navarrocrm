
import React from 'react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { 
  MoreHorizontal, 
  CheckCircle,
  XCircle,
  FileText,
  Edit,
  Eye
} from 'lucide-react'
import type { Proposal } from '@/types/proposals'

interface ProposalCardActionsProps {
  proposal: Proposal
  onStatusChange: (id: string, status: string) => void
  onView: (proposal: Proposal) => void
}

export const ProposalCardActions: React.FC<ProposalCardActionsProps> = ({
  proposal,
  onStatusChange,
  onView
}) => {
  return (
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
  )
}
