
import React from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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
  Eye, 
  Edit, 
  Pause, 
  Play, 
  X, 
  Calendar,
  Clock,
  DollarSign,
  User
} from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface RecurringProposalsTableProps {
  proposals: any[]
  onStatusChange: (id: string, status: any) => void
  onViewProposal: (proposal: any) => void
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'draft': return 'bg-gray-100 text-gray-800'
    case 'sent': return 'bg-blue-100 text-blue-800'
    case 'negotiating': return 'bg-yellow-100 text-yellow-800'
    case 'won': return 'bg-green-100 text-green-800'
    case 'lost': return 'bg-red-100 text-red-800'
    case 'expired': return 'bg-gray-100 text-gray-600'
    default: return 'bg-gray-100 text-gray-800'
  }
}

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'draft': return 'Borrador'
    case 'sent': return 'Enviada'
    case 'negotiating': return 'Negociando'
    case 'won': return 'Ganada'
    case 'lost': return 'Perdida'
    case 'expired': return 'Expirada'
    default: return status
  }
}

const getFrequencyLabel = (frequency: string) => {
  switch (frequency) {
    case 'monthly': return 'Mensual'
    case 'quarterly': return 'Trimestral'
    case 'yearly': return 'Anual'
    default: return frequency || 'No definida'
  }
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount || 0)
}

const formatDate = (date: string | null) => {
  if (!date) return 'No definida'
  return format(new Date(date), 'dd/MM/yyyy', { locale: es })
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
                    <div>
                      <div className="font-medium text-gray-900">
                        {proposal.title}
                      </div>
                      <div className="text-sm text-gray-500">
                        {proposal.proposal_number}
                      </div>
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-400" />
                      <div>
                        <div className="font-medium">
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
