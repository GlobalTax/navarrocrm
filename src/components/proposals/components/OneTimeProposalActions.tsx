
import React from 'react'
import { Button } from '@/components/ui/button'
import { 
  Eye, 
  Edit, 
  Send, 
  Copy
} from 'lucide-react'

interface OneTimeProposalActionsProps {
  proposal: any
  onViewProposal: (proposal: any) => void
  onStatusChange: (id: string, status: any) => void
}

export const OneTimeProposalActions: React.FC<OneTimeProposalActionsProps> = ({
  proposal,
  onViewProposal,
  onStatusChange
}) => {
  return (
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onViewProposal(proposal)}
        className="h-8 w-8 p-0"
        title="Ver propuesta"
      >
        <Eye className="h-4 w-4" />
      </Button>
      
      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0"
        title="Editar propuesta"
      >
        <Edit className="h-4 w-4" />
      </Button>
      
      {proposal.status === 'draft' && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onStatusChange(proposal.id, 'sent')}
          className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700"
          title="Enviar propuesta"
        >
          <Send className="h-4 w-4" />
        </Button>
      )}
      
      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0 text-gray-600 hover:text-gray-700"
        title="Duplicar propuesta"
      >
        <Copy className="h-4 w-4" />
      </Button>
    </div>
  )
}
