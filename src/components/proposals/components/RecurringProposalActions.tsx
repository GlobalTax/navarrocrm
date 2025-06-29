
import React from 'react'
import { Button } from '@/components/ui/button'
import { 
  Eye, 
  Edit, 
  Pause, 
  Play, 
  X
} from 'lucide-react'

interface RecurringProposalActionsProps {
  proposal: any
  onViewProposal: (proposal: any) => void
  onStatusChange: (id: string, status: any) => void
}

export const RecurringProposalActions: React.FC<RecurringProposalActionsProps> = ({
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
      >
        <Eye className="h-4 w-4" />
      </Button>
      
      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0"
      >
        <Edit className="h-4 w-4" />
      </Button>
      
      {proposal.status === 'won' && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onStatusChange(proposal.id, 'paused')}
          className="h-8 w-8 p-0 text-yellow-600 hover:text-yellow-700"
        >
          <Pause className="h-4 w-4" />
        </Button>
      )}
      
      {proposal.status === 'paused' && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onStatusChange(proposal.id, 'won')}
          className="h-8 w-8 p-0 text-green-600 hover:text-green-700"
        >
          <Play className="h-4 w-4" />
        </Button>
      )}
      
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onStatusChange(proposal.id, 'cancelled')}
        className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  )
}
