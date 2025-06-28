
import React from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { 
  MoreHorizontal, 
  Eye, 
  Edit, 
  CheckCircle,
  XCircle,
  FileText,
  Repeat,
  Clock,
  User,
  Euro
} from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import type { Proposal } from '@/types/proposals'

interface ProposalsTableProps {
  proposals: Proposal[]
  onStatusChange: (id: string, status: string) => void
  onViewProposal: (proposal: Proposal) => void
}

export const ProposalsTable = ({ proposals, onStatusChange, onViewProposal }: ProposalsTableProps) => {
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'draft': { label: 'Borrador', className: 'bg-gray-50 text-gray-600 border-gray-200' },
      'sent': { label: 'Enviada', className: 'bg-blue-50 text-blue-700 border-blue-200' },
      'won': { label: 'Ganada', className: 'bg-green-50 text-green-700 border-green-200' },
      'lost': { label: 'Perdida', className: 'bg-red-50 text-red-600 border-red-200' },
      'negotiating': { label: 'Negociando', className: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
      'expired': { label: 'Expirada', className: 'bg-gray-50 text-gray-500 border-gray-200' }
    }
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft
    return (
      <Badge className={`text-xs font-medium border ${config.className}`}>
        {config.label}
      </Badge>
    )
  }

  const getTypeBadge = (isRecurring: boolean) => {
    if (isRecurring) {
      return (
        <div className="flex items-center gap-1.5 text-blue-700 bg-blue-50 px-2 py-1 rounded-md text-xs font-medium">
          <Repeat className="w-3 h-3" />
          <span>Recurrente</span>
        </div>
      )
    } else {
      return (
        <div className="flex items-center gap-1.5 text-green-700 bg-green-50 px-2 py-1 rounded-md text-xs font-medium">
          <FileText className="w-3 h-3" />
          <span>Puntual</span>
        </div>
      )
    }
  }

  if (proposals.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
        <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
        <div className="text-gray-500 text-lg mb-2">No hay propuestas</div>
        <p className="text-gray-400 text-sm">Crea tu primera propuesta comercial</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="border-gray-100 hover:bg-transparent">
            <TableHead className="font-semibold text-gray-900 py-4 px-6">Propuesta</TableHead>
            <TableHead className="font-semibold text-gray-900 py-4 px-6">Cliente</TableHead>
            <TableHead className="font-semibold text-gray-900 py-4 px-6">Tipo</TableHead>
            <TableHead className="font-semibold text-gray-900 py-4 px-6">Estado</TableHead>
            <TableHead className="font-semibold text-gray-900 py-4 px-6">Importe</TableHead>
            <TableHead className="font-semibold text-gray-900 py-4 px-6">Creada</TableHead>
            <TableHead className="font-semibold text-gray-900 py-4 px-6">Válida hasta</TableHead>
            <TableHead className="text-right font-semibold text-gray-900 py-4 px-6">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {proposals.map((proposal) => (
            <TableRow 
              key={proposal.id} 
              className="border-gray-50 hover:bg-gray-25 transition-colors duration-150 group"
            >
              <TableCell className="py-4 px-6">
                <div>
                  <div className="font-semibold text-gray-900 text-sm mb-1">
                    {proposal.title}
                  </div>
                  {proposal.description && (
                    <div className="text-xs text-gray-500 line-clamp-1">
                      {proposal.description}
                    </div>
                  )}
                </div>
              </TableCell>
              
              <TableCell className="py-4 px-6">
                <div className="flex items-center gap-2">
                  <User className="w-3.5 h-3.5 text-gray-400" />
                  <span className="text-sm text-gray-900">
                    {proposal.client?.name || 'Sin cliente'}
                  </span>
                </div>
              </TableCell>
              
              <TableCell className="py-4 px-6">
                {getTypeBadge(proposal.is_recurring)}
              </TableCell>
              
              <TableCell className="py-4 px-6">
                {getStatusBadge(proposal.status)}
              </TableCell>
              
              <TableCell className="py-4 px-6">
                <div className="flex items-center gap-1">
                  <Euro className="w-3.5 h-3.5 text-gray-400" />
                  <span className="text-sm font-semibold text-gray-900">
                    {proposal.total_amount?.toFixed(2) || '0.00'}
                  </span>
                </div>
              </TableCell>
              
              <TableCell className="py-4 px-6">
                <div className="text-sm text-gray-600">
                  {format(new Date(proposal.created_at), 'dd/MM/yyyy', { locale: es })}
                </div>
              </TableCell>
              
              <TableCell className="py-4 px-6">
                {proposal.valid_until ? (
                  <div className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      {format(new Date(proposal.valid_until), 'dd/MM/yyyy', { locale: es })}
                    </span>
                  </div>
                ) : (
                  <span className="text-gray-400 text-sm">-</span>
                )}
              </TableCell>
              
              <TableCell className="text-right py-4 px-6">
                <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 hover:bg-gray-100 transition-colors"
                    onClick={() => onViewProposal(proposal)}
                  >
                    <Eye className="h-3.5 w-3.5 text-gray-600" />
                  </Button>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 hover:bg-gray-100 transition-colors"
                      >
                        <MoreHorizontal className="h-3.5 w-3.5 text-gray-600" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => onViewProposal(proposal)}>
                        <Eye className="w-4 h-4 mr-2" />
                        Ver detalles
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Edit className="w-4 h-4 mr-2" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuLabel>Cambiar estado</DropdownMenuLabel>
                      {proposal.status !== 'won' && (
                        <DropdownMenuItem 
                          onClick={() => onStatusChange(proposal.id, 'won')}
                          className="text-green-600"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Marcar como ganada
                        </DropdownMenuItem>
                      )}
                      {proposal.status !== 'lost' && (
                        <DropdownMenuItem 
                          onClick={() => onStatusChange(proposal.id, 'lost')}
                          className="text-red-600"
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          Marcar como perdida
                        </DropdownMenuItem>
                      )}
                      {proposal.status !== 'sent' && proposal.status !== 'won' && proposal.status !== 'lost' && (
                        <DropdownMenuItem onClick={() => onStatusChange(proposal.id, 'sent')}>
                          <FileText className="w-4 h-4 mr-2" />
                          Marcar como enviada
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
