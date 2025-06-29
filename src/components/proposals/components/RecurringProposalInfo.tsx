
import React from 'react'

interface RecurringProposalInfoProps {
  title: string
  proposalNumber: string
}

export const RecurringProposalInfo: React.FC<RecurringProposalInfoProps> = ({
  title,
  proposalNumber
}) => {
  return (
    <div>
      <div className="font-medium text-gray-900">
        {title}
      </div>
      <div className="text-sm text-gray-500">
        {proposalNumber}
      </div>
    </div>
  )
}
