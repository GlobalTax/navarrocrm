
import React from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { getFrequencyText } from '../utils/proposalCardUtils'
import type { Proposal } from '@/types/proposals'

interface ProposalCardRecurringInfoProps {
  proposal: Proposal
}

export const ProposalCardRecurringInfo: React.FC<ProposalCardRecurringInfoProps> = ({
  proposal
}) => {
  if (!proposal.is_recurring) return null

  return (
    <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
      <p className="text-sm font-medium text-blue-900 mb-1">Configuración Recurrente</p>
      <div className="grid grid-cols-2 gap-2 text-xs text-blue-700">
        {proposal.recurring_frequency && (
          <div>
            <span>Facturación: </span>
            <span className="font-medium">
              {getFrequencyText(proposal.recurring_frequency)}
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
            <span>Horas incluidas: </span>
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
  )
}
