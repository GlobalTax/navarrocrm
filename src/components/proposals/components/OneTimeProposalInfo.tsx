
import React from 'react'

interface OneTimeProposalInfoProps {
  title: string
  proposalNumber: string
  description?: string
}

export const OneTimeProposalInfo: React.FC<OneTimeProposalInfoProps> = ({
  title,
  proposalNumber,
  description
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
    </div>
  )
}
