
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
  Send, 
  Copy,
  Archive,
  FileText,
  Repeat,
  DollarSign,
  User,
  Calendar
} from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface AllProposalsTableProps {
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

export const AllProposalsTable: React.FC<AllProposalsTableProps> = ({
  proposals,
  onStatusChange,
  onViewProposal
}) => {
  if (proposals.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No hay propuestas
          </h3>
          <p className="text-gray-500">
            Las propuestas aparecerán aquí una vez que las crees
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Todas las Propuestas ({proposals.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Propuesta</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Importe</TableHead>
                <TableHead>Fecha Creación</TableHead>
                <TableHead>Fecha Envío</TableHead>
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
                    <div className="flex items-center gap-2">
                      {proposal.is_recurring ? (
                        <Badge variant="outline" className="flex items-center gap-1 bg-blue-50 text-blue-700 border-blue-200">
                          <Repeat className="h-3 w-3" />
                          Recurrente
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="flex items-center gap-1 bg-green-50 text-green-700 border-green-200">
                          <FileText className="h-3 w-3" />
                          Puntual
                        </Badge>
                      )}
                    </div>
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
                      {proposal.is_recurring && proposal.recurring_frequency && (
                        <span className="text-xs text-gray-500">
                          /{proposal.recurring_frequency === 'monthly' ? 'mes' : 
                            proposal.recurring_frequency === 'quarterly' ? 'trim' : 'año'}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">
                        {formatDate(proposal.created_at)}
                      </span>
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <span className="text-sm">
                      {proposal.sent_at ? formatDate(proposal.sent_at) : 'No enviada'}
                    </span>
                  </TableCell>
                  
                  <TableCell>
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
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onStatusChange(proposal.id, 'archived')}
                        className="h-8 w-8 p-0 text-orange-600 hover:text-orange-700"
                        title="Archivar propuesta"
                      >
                        <Archive className="h-4 w-4" />
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
