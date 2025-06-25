
import React from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MoreHorizontal, Repeat, FileText, User, Calendar } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { getStatusColor, getStatusText } from '../utils/proposalCardUtils'
import type { Proposal } from '@/types/proposals'

interface ProposalCardHeaderProps {
  proposal: Proposal
  onMoreClick: () => void
}

export const ProposalCardHeader: React.FC<ProposalCardHeaderProps> = ({
  proposal,
  onMoreClick
}) => {
  const getProposalTypeBadge = () => {
    if (proposal.is_recurring) {
      return (
        <Badge className="bg-blue-100 text-blue-800 border-blue-200">
          <Repeat className="w-3 h-3 mr-1" />
          Recurrente
        </Badge>
      )
    } else {
      return (
        <Badge className="bg-green-100 text-green-800 border-green-200">
          <FileText className="w-3 h-3 mr-1" />
          Puntual
        </Badge>
      )
    }
  }

  return (
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-2">
          {getProposalTypeBadge()}
          <Badge className={getStatusColor(proposal.status)}>
            {getStatusText(proposal.status)}
          </Badge>
        </div>
        
        <h3 className="text-lg font-semibold mb-2">
          {proposal.title}
        </h3>
        
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
      
      <Button variant="ghost" size="sm" onClick={onMoreClick}>
        <MoreHorizontal className="w-4 h-4" />
      </Button>
    </div>
  )
}
