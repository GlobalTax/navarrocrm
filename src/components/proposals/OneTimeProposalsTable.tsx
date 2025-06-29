
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
import { OneTimeProposalInfo } from './components/OneTimeProposalInfo'
import { OneTimeProposalClientInfo } from './components/OneTimeProposalClientInfo'
import { OneTimeProposalActions } from './components/OneTimeProposalActions'
import { OneTimeProposalTypeInfo } from './components/OneTimeProposalTypeInfo'
import { getStatusColor, getStatusLabel, formatCurrency, formatDate } from './utils/proposalFormatters'

interface OneTimeProposalsTableProps {
  proposals: any[]
  onStatusChange: (id: string, status: any) => void
  onViewProposal: (proposal: any) => void
  onEditProposal?: (proposal: any) => void
  onDuplicateProposal?: (proposal: any) => void
}

export const OneTimeProposalsTable: React.FC<OneTimeProposalsTableProps> = ({
  proposals,
  onStatusChange,
  onViewProposal,
  onEditProposal = () => {},
  onDuplicateProposal = () => {}
}) => {
  if (proposals.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No hay propuestas puntuales para mostrar
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
                <OneTimeProposalInfo
                  title={proposal.title}
                  proposalNumber={proposal.proposal_number}
                  description={proposal.description}
                />
              </TableCell>
              <TableCell>
                <OneTimeProposalClientInfo client={proposal.client} />
              </TableCell>
              <TableCell>
                <OneTimeProposalTypeInfo proposalType={proposal.proposal_type} />
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
                <OneTimeProposalActions
                  proposal={proposal}
                  onViewProposal={onViewProposal}
                  onEditProposal={onEditProposal}
                  onDuplicateProposal={onDuplicateProposal}
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
