
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
  Send, 
  Copy,
  CheckCircle,
  XCircle
} from 'lucide-react'

interface OneTimeProposalActionsProps {
  proposal: any
  onViewProposal: (proposal: any) => void
  onEditProposal: (proposal: any) => void
  onDuplicateProposal: (proposal: any) => void
  onStatusChange: (id: string, status: any) => void
}

export const OneTimeProposalActions: React.FC<OneTimeProposalActionsProps> = ({
  proposal,
  onViewProposal,
  onEditProposal,
  onDuplicateProposal,
  onStatusChange
}) => {
  return (
    <TooltipProvider>
      <div className="flex items-center gap-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onViewProposal(proposal)}
              className="h-8 w-8 p-0 hover:bg-blue-50"
              title="Ver propuesta"
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
              title="Editar propuesta"
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
              title="Duplicar propuesta"
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
                title="Enviar propuesta"
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
                  title="Marcar como ganada"
                >
                  <CheckCircle className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Marcar como ganada</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onStatusChange(proposal.id, 'lost')}
                  className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                  title="Marcar como perdida"
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
      </div>
    </TooltipProvider>
  )
}
