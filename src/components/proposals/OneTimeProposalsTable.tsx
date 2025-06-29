
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
  Briefcase,
  DollarSign,
  Calendar
} from 'lucide-react'
import { OneTimeProposalInfo } from './components/OneTimeProposalInfo'
import { OneTimeProposalClientInfo } from './components/OneTimeProposalClientInfo'
import { OneTimeProposalActions } from './components/OneTimeProposalActions'
import { OneTimeProposalTypeInfo } from './components/OneTimeProposalTypeInfo'
import { 
  getStatusColor, 
  getStatusLabel, 
  formatCurrency, 
  formatDate 
} from './utils/proposalFormatters'

interface OneTimeProposalsTableProps {
  proposals: any[]
  onStatusChange: (id: string, status: any) => void
  onViewProposal: (proposal: any) => void
}

export const OneTimeProposalsTable: React.FC<OneTimeProposalsTableProps> = ({
  proposals,
  onStatusChange,
  onViewProposal
}) => {
  if (proposals.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No hay propuestas puntuales
          </h3>
          <p className="text-gray-500">
            Las propuestas para proyectos específicos aparecerán aquí
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Briefcase className="h-5 w-5" />
          Propuestas Puntuales ({proposals.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Propuesta</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Tipo de Proyecto</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Importe Total</TableHead>
                <TableHead>Fecha Límite</TableHead>
                <TableHead>Creada</TableHead>
                <TableHead>Acciones</TableHead>
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
                  
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4 text-green-600" />
                      <span className="font-medium">
                        {formatCurrency(proposal.total_amount)}
                      </span>
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">
                        {formatDate(proposal.valid_until)}
                      </span>
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <span className="text-sm">
                      {formatDate(proposal.created_at)}
                    </span>
                  </TableCell>
                  
                  <TableCell>
                    <OneTimeProposalActions
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
