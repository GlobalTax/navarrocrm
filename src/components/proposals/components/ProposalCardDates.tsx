
import React from 'react'
import { Clock, FileText, CheckCircle } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import type { Proposal } from '@/types/proposals'

interface ProposalCardDatesProps {
  proposal: Proposal
}

export const ProposalCardDates: React.FC<ProposalCardDatesProps> = ({
  proposal
}) => {
  const hasImportantDates = proposal.valid_until || proposal.sent_at || proposal.accepted_at

  if (!hasImportantDates) return null

  return (
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
  )
}
