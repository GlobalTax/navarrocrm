
import React from 'react'

interface ProposalHistoryEmptyStateProps {
  message: string
}

export const ProposalHistoryEmptyState: React.FC<ProposalHistoryEmptyStateProps> = ({
  message
}) => {
  return (
    <div className="text-center py-8 text-gray-500">
      {message}
    </div>
  )
}
