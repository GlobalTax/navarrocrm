
import React from 'react'
import { Button } from '@/components/ui/button'
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { 
  Eye, 
  Edit, 
  Pause, 
  Play, 
  X,
  Copy,
  CheckCircle,
  XCircle,
  Send,
  Trash2
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'

interface RecurringProposalActionsProps {
  proposal: any
  onViewProposal: (proposal: any) => void
  onEditProposal: (proposal: any) => void
  onDuplicateProposal: (proposal: any) => void
  onDeleteProposal?: (proposal: any) => void
  onStatusChange: (id: string, status: any) => void
}

export const RecurringProposalActions: React.FC<RecurringProposalActionsProps> = ({
  proposal,
  onViewProposal,
  onEditProposal,
  onDuplicateProposal,
  onDeleteProposal,
  onStatusChange
}) => {
  const navigate = useNavigate()
  return (
    <TooltipProvider>
      <div className="flex items-center gap-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(`/proposals/${proposal.id}`)}
              className="h-8 w-8 p-0 hover:bg-blue-50"
            >
              <Eye className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Ver detalles de la propuesta</p>
          </TooltipContent>
        </Tooltip>
        
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEditProposal(proposal)}
              className="h-8 w-8 p-0 hover:bg-gray-50"
            >
              <Edit className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Editar propuesta</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDuplicateProposal(proposal)}
              className="h-8 w-8 p-0 hover:bg-green-50"
            >
              <Copy className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Crear una copia de esta propuesta</p>
          </TooltipContent>
        </Tooltip>
        
        {proposal.status === 'draft' && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onStatusChange(proposal.id, 'sent')}
                className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
              >
                <Send className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Marcar como enviada</p>
            </TooltipContent>
          </Tooltip>
        )}

        {(proposal.status === 'sent' || proposal.status === 'negotiating') && (
          <>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onStatusChange(proposal.id, 'won')}
                  className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                >
                  <CheckCircle className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Marcar como ganada (creará cuota recurrente)</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onStatusChange(proposal.id, 'lost')}
                  className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <XCircle className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Marcar como perdida</p>
              </TooltipContent>
            </Tooltip>
          </>
        )}
        
        {proposal.status === 'won' && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onStatusChange(proposal.id, 'paused')}
                className="h-8 w-8 p-0 text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50"
              >
                <Pause className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Pausar servicio recurrente</p>
            </TooltipContent>
          </Tooltip>
        )}
        
        {proposal.status === 'paused' && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onStatusChange(proposal.id, 'won')}
                className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
              >
                <Play className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Reactivar servicio recurrente</p>
            </TooltipContent>
          </Tooltip>
        )}

        {onDeleteProposal && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDeleteProposal(proposal)}
                className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Eliminar propuesta</p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </TooltipProvider>
  )
}
