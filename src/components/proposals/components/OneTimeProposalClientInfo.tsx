
import React from 'react'
import { User } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

interface OneTimeProposalClientInfoProps {
  client: any
}

export const OneTimeProposalClientInfo: React.FC<OneTimeProposalClientInfoProps> = ({
  client
}) => {
  const navigate = useNavigate()

  const handleClientClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (client?.id) {
      navigate(`/contacts/${client.id}`)
    }
  }

  return (
    <div 
      className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded-md transition-colors"
      onClick={handleClientClick}
    >
      <User className="h-4 w-4 text-gray-400" />
      <div>
        <div className="font-medium text-blue-600 hover:text-blue-800">
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
