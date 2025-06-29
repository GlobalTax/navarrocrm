
import React from 'react'

interface RecurringProposalInfoProps {
  title: string
  proposalNumber: string
  description?: string
  retainerAmount?: number
  includedHours?: number
}

export const RecurringProposalInfo: React.FC<RecurringProposalInfoProps> = ({
  title,
  proposalNumber,
  description,
  retainerAmount,
  includedHours
}) => {
  return (
    <div>
      <div className="font-medium text-gray-900">
        {title}
      </div>
      <div className="text-sm text-gray-500">
        {proposalNumber}
      </div>
      {description && (
        <div className="text-xs text-gray-400 mt-1 max-w-xs truncate">
          {description}
        </div>
      )}
      <div className="flex gap-4 mt-1 text-xs text-gray-500">
        {retainerAmount && (
          <span>Igualas: {new Intl.NumberFormat('es-ES', {
            style: 'currency',
            currency: 'EUR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
          }).format(retainerAmount)}</span>
        )}
        {includedHours && (
          <span>Horas incluidas: {includedHours}h</span>
        )}
      </div>
    </div>
  )
}
