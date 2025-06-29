
import React from 'react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { 
  Calendar,
  Clock,
  DollarSign
} from 'lucide-react'
import { RecurringProposalActions } from './components/RecurringProposalActions'
import { RecurringProposalClientInfo } from './components/RecurringProposalClientInfo'
import { RecurringProposalInfo } from './components/RecurringProposalInfo'
import { 
  getStatusColor, 
  getStatusLabel, 
  getFrequencyLabel, 
  formatCurrency, 
  formatDate 
} from './utils/proposalFormatters'

interface RecurringProposalsTableProps {
  proposals: any[]
  onStatusChange: (id: string, status: any) => void
  onViewProposal: (proposal: any) => void
}

export const RecurringProposalsTable: React.FC<RecurringProposalsTableProps> = ({
  proposals,
  onStatusChange,
  onViewProposal
}) => {
  if (proposals.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No hay propuestas recurrentes
          </h3>
          <p className="text-gray-500">
            Las propuestas recurrentes aparecerán aquí una vez que las crees
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Propuestas Recurrentes ({proposals.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Propuesta</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Frecuencia</TableHead>
                <TableHead>Importe Base</TableHead>
                <TableHead>Horas Incluidas</TableHead>
                <TableHead>Tarifa Extra</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Inicio Contrato</TableHead>
                <TableHead>Próxima Facturación</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {proposals.map((proposal) => (
                <TableRow key={proposal.id} className="hover:bg-gray-50">
                  <TableCell>
                    <RecurringProposalInfo 
                      title={proposal.title}
                      proposalNumber={proposal.proposal_number}
                    />
                  </TableCell>
                  
                  <TableCell>
                    <RecurringProposalClientInfo client={proposal.client} />
                  </TableCell>
                  
                  <TableCell>
                    <Badge variant="outline" className="flex items-center gap-1 w-fit">
                      <Clock className="h-3 w-3" />
                      {getFrequencyLabel(proposal.recurring_frequency)}
                    </Badge>
                  </TableCell>
                  
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4 text-green-600" />
                      <span className="font-medium">
                        {formatCurrency(proposal.retainer_amount || proposal.total_amount)}
                      </span>
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div className="text-center">
                      <span className="font-medium">{proposal.included_hours || 0}</span>
                      <span className="text-sm text-gray-500 ml-1">horas</span>
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <span className="font-medium">
                      {formatCurrency(proposal.hourly_rate_extra || 0)}/h
                    </span>
                  </TableCell>
                  
                  <TableCell>
                    <Badge className={getStatusColor(proposal.status)}>
                      {getStatusLabel(proposal.status)}
                    </Badge>
                  </TableCell>
                  
                  <TableCell>
                    <span className="text-sm">
                      {formatDate(proposal.contract_start_date)}
                    </span>
                  </TableCell>
                  
                  <TableCell>
                    <span className="text-sm">
                      {formatDate(proposal.next_billing_date)}
                    </span>
                  </TableCell>
                  
                  <TableCell>
                    <RecurringProposalActions
                      proposal={proposal}
                      onViewProposal={onViewProposal}
                      onStatusChange={onStatusChange}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
