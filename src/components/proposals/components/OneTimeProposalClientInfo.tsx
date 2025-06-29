
import React from 'react'
import { User } from 'lucide-react'

interface OneTimeProposalClientInfoProps {
  client: any
}

export const OneTimeProposalClientInfo: React.FC<OneTimeProposalClientInfoProps> = ({
  client
}) => {
  return (
    <div className="flex items-center gap-2">
      <User className="h-4 w-4 text-gray-400" />
      <div>
        <div className="font-medium">
          {client?.name || 'Sin cliente'}
        </div>
        {client?.email && (
          <div className="text-sm text-gray-500">
            {client.email}
          </div>
        )}
      </div>
    </div>
  )
}
