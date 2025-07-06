
import React from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Repeat, FileText, User } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { OneTimeProposalActions } from './components/OneTimeProposalActions'
import { RecurringProposalActions } from './components/RecurringProposalActions'
import { getStatusColor, getStatusLabel, formatCurrency, formatDate } from './utils/proposalFormatters'

interface AllProposalsTableProps {
  proposals: any[]
  onStatusChange: (id: string, status: any) => void
  onViewProposal: (proposal: any) => void
  onEditProposal?: (proposal: any) => void
  onDuplicateProposal?: (proposal: any) => void
}

export const AllProposalsTable: React.FC<AllProposalsTableProps> = ({
  proposals,
  onStatusChange,
  onViewProposal,
  onEditProposal = () => {},
  onDuplicateProposal = () => {}
}) => {
  const navigate = useNavigate()

  const handleClientClick = (e: React.MouseEvent, clientId: string) => {
    e.stopPropagation()
    if (clientId) {
      navigate(`/contacts/${clientId}`)
    }
  }

  if (proposals.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No hay propuestas para mostrar
      </div>
    )
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Propuesta</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Importe</TableHead>
            <TableHead>Fecha</TableHead>
            <TableHead className="text-center">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {proposals.map((proposal) => (
            <TableRow key={proposal.id} className="hover:bg-gray-50">
              <TableCell>
                <div>
                  <div className="font-medium text-gray-900">
                    {proposal.title}
                  </div>
                  <div className="text-sm text-gray-500">
                    {proposal.proposal_number || 'Sin número'}
                  </div>
                  {proposal.description && (
                    <div className="text-xs text-gray-400 mt-1 max-w-xs truncate">
                      {proposal.description}
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div 
                  className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded-md transition-colors"
                  onClick={(e) => handleClientClick(e, proposal.client?.id)}
                >
                  <User className="h-4 w-4 text-gray-400" />
                  <div>
                    <div className="font-medium text-blue-600 hover:text-blue-800">
                      {proposal.client?.name || 'Sin cliente'}
                    </div>
                    {proposal.client?.email && (
                      <div className="text-sm text-gray-500">
                        {proposal.client.email}
                      </div>
                    )}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                {proposal.is_recurring ? (
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    <Repeat className="w-3 h-3 mr-1" />
                    Recurrente
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    <FileText className="w-3 h-3 mr-1" />
                    Puntual
                  </Badge>
                )}
              </TableCell>
              <TableCell>
                <Badge className={getStatusColor(proposal.status)}>
                  {getStatusLabel(proposal.status)}
                </Badge>
              </TableCell>
              <TableCell className="font-semibold text-green-600">
                {formatCurrency(proposal.total_amount)}
              </TableCell>
              <TableCell className="text-sm text-gray-500">
                {formatDate(proposal.created_at)}
              </TableCell>
              <TableCell>
                {proposal.is_recurring ? (
                  <RecurringProposalActions
                    proposal={proposal}
                    onViewProposal={onViewProposal}
                    onEditProposal={onEditProposal}
                    onDuplicateProposal={onDuplicateProposal}
                    onStatusChange={onStatusChange}
                  />
                ) : (
                  <OneTimeProposalActions
                    proposal={proposal}
                    onViewProposal={onViewProposal}
                    onEditProposal={onEditProposal}
                    onDuplicateProposal={onDuplicateProposal}
                    onStatusChange={onStatusChange}
                  />
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
