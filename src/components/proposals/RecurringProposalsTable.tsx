
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
import { RecurringProposalInfo } from './components/RecurringProposalInfo'
import { RecurringProposalClientInfo } from './components/RecurringProposalClientInfo'
import { RecurringProposalActions } from './components/RecurringProposalActions'
import { getStatusColor, getStatusLabel, getFrequencyLabel, formatCurrency, formatDate } from './utils/proposalFormatters'

interface RecurringProposalsTableProps {
  proposals: any[]
  onStatusChange: (id: string, status: any) => void
  onViewProposal: (proposal: any) => void
  onEditProposal?: (proposal: any) => void
  onDuplicateProposal?: (proposal: any) => void
  onDeleteProposal?: (proposal: any) => void
}

export const RecurringProposalsTable: React.FC<RecurringProposalsTableProps> = ({
  proposals,
  onStatusChange,
  onViewProposal,
  onEditProposal = () => {},
  onDuplicateProposal = () => {},
  onDeleteProposal
}) => {
  if (proposals.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No hay propuestas recurrentes para mostrar
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
            <TableHead>Frecuencia</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Importe</TableHead>
            <TableHead>Próxima Facturación</TableHead>
            <TableHead className="text-center">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {proposals.map((proposal) => (
            <TableRow key={proposal.id} className="hover:bg-gray-50">
              <TableCell>
                <RecurringProposalInfo
                  title={proposal.title}
                  proposalNumber={proposal.proposal_number}
                  description={proposal.description}
                  retainerAmount={proposal.retainer_amount}
                  includedHours={proposal.included_hours}
                />
              </TableCell>
              <TableCell>
                <RecurringProposalClientInfo client={proposal.client} />
              </TableCell>
              <TableCell>
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  {getFrequencyLabel(proposal.recurring_frequency)}
                </Badge>
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
                {formatDate(proposal.next_billing_date)}
              </TableCell>
              <TableCell>
                <RecurringProposalActions
                  proposal={proposal}
                  onViewProposal={onViewProposal}
                  onEditProposal={onEditProposal}
                  onDuplicateProposal={onDuplicateProposal}
                  onDeleteProposal={onDeleteProposal}
                  onStatusChange={onStatusChange}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
