
import React from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Eye, Edit, Trash2, FileText } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'

interface LegalProposal {
  id: string
  title: string
  client_name: string
  practice_area: string
  status: string
  total_amount: number
  created_at: string
  valid_until: string
}

interface LegalProposalsTableProps {
  proposals: LegalProposal[]
  onViewProposal: (proposal: LegalProposal) => void
  onEditProposal: (proposal: LegalProposal) => void
  onDeleteProposal: (proposal: LegalProposal) => void
}

const getStatusBadge = (status: string) => {
  const statusConfig = {
    'draft': { label: 'Borrador', variant: 'secondary' as const },
    'sent': { label: 'Enviada', variant: 'default' as const },
    'accepted': { label: 'Aceptada', variant: 'default' as const },
    'rejected': { label: 'Rechazada', variant: 'destructive' as const },
    'expired': { label: 'Expirada', variant: 'outline' as const }
  }
  
  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft
  return <Badge variant={config.variant}>{config.label}</Badge>
}

export const LegalProposalsTable: React.FC<LegalProposalsTableProps> = ({
  proposals,
  onViewProposal,
  onEditProposal,
  onDeleteProposal
}) => {
  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Propuesta</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead>Área de Práctica</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Importe</TableHead>
            <TableHead>Creada</TableHead>
            <TableHead>Válida hasta</TableHead>
            <TableHead className="w-32">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {proposals.map((proposal) => (
            <TableRow key={proposal.id}>
              <TableCell className="font-medium">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-blue-600" />
                  {proposal.title}
                </div>
              </TableCell>
              <TableCell>{proposal.client_name}</TableCell>
              <TableCell>
                <Badge variant="outline">{proposal.practice_area}</Badge>
              </TableCell>
              <TableCell>
                {getStatusBadge(proposal.status)}
              </TableCell>
              <TableCell className="font-semibold">
                {proposal.total_amount.toLocaleString('es-ES', {
                  style: 'currency',
                  currency: 'EUR'
                })}
              </TableCell>
              <TableCell className="text-gray-600">
                {formatDistanceToNow(new Date(proposal.created_at), {
                  addSuffix: true,
                  locale: es
                })}
              </TableCell>
              <TableCell className="text-gray-600">
                {new Date(proposal.valid_until).toLocaleDateString('es-ES')}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onViewProposal(proposal)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onEditProposal(proposal)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onDeleteProposal(proposal)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
