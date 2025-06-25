
import React from 'react'
import { Repeat, ArrowRight, Target, FileText, Briefcase } from 'lucide-react'
import type { Proposal } from '@/types/proposals'

interface ProposalCardConversionInfoProps {
  proposal: Proposal
}

export const ProposalCardConversionInfo: React.FC<ProposalCardConversionInfoProps> = ({
  proposal
}) => {
  if (proposal.status !== 'won') return null

  if (proposal.is_recurring) {
    return (
      <div className="flex items-center gap-2 text-sm bg-blue-50 text-blue-700 p-2 rounded">
        <Repeat className="w-3 h-3" />
        <ArrowRight className="w-3 h-3" />
        <Target className="w-3 h-3" />
        <span className="font-medium">Genera Cuota Recurrente</span>
      </div>
    )
  } else {
    return (
      <div className="flex items-center gap-2 text-sm bg-green-50 text-green-700 p-2 rounded">
        <FileText className="w-3 h-3" />
        <ArrowRight className="w-3 h-3" />
        <Briefcase className="w-3 h-3" />
        <span className="font-medium">Genera Expediente</span>
      </div>
    )
  }
}
