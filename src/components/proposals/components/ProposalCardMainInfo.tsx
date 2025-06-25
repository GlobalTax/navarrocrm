
import React from 'react'
import type { Proposal } from '@/types/proposals'

interface ProposalCardMainInfoProps {
  proposal: Proposal
}

export const ProposalCardMainInfo: React.FC<ProposalCardMainInfoProps> = ({
  proposal
}) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <p className="text-sm text-muted-foreground">Importe total</p>
        <p className="text-xl font-bold text-green-600">
          {proposal.total_amount?.toFixed(2)} €
        </p>
      </div>
      <div>
        <p className="text-sm text-muted-foreground">Tipo de servicio</p>
        <p className="text-sm font-medium">
          {proposal.is_recurring ? 'Servicio continuo' : 'Proyecto específico'}
        </p>
      </div>
    </div>
  )
}
