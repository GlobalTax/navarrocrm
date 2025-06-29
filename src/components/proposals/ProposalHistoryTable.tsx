
import React, { useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useProposalHistory } from '@/hooks/proposals/useProposalHistory'
import { formatDate } from './utils/proposalFormatters'
import { getStatusColor, getStatusLabel } from './utils/proposalFormatters'
import { ProposalHistoryFilters } from './ProposalHistoryFilters'

interface ProposalHistoryTableProps {
  proposalId?: string
  showFilters?: boolean
}

export const ProposalHistoryTable: React.FC<ProposalHistoryTableProps> = ({
  proposalId,
  showFilters = true
}) => {
  const { 
    historyEntries, 
    isLoading, 
    getActionLabel, 
    getActionIcon, 
    getStatusChange, 
    getAmountChange 
  } = useProposalHistory(proposalId)
  
  const [filters, setFilters] = useState({
    actionType: 'all',
    dateFrom: undefined as Date | undefined,
    dateTo: undefined as Date | undefined,
    search: ''
  })

  const filteredEntries = historyEntries.filter(entry => {
    if (filters.actionType !== 'all' && entry.action_type !== filters.actionType) {
      return false
    }

    if (filters.search && !entry.proposals?.title?.toLowerCase().includes(filters.search.toLowerCase())) {
      return false
    }

    if (filters.dateFrom && new Date(entry.created_at) < filters.dateFrom) {
      return false
    }

    if (filters.dateTo && new Date(entry.created_at) > filters.dateTo) {
      return false
    }

    return true
  })

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Historial de Propuestas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            Cargando historial...
          </div>
        </CardContent>
      </Card>
    )
  }

  if (filteredEntries.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Historial de Propuestas</CardTitle>
        </CardHeader>
        <CardContent>
          {showFilters && (
            <ProposalHistoryFilters 
              filters={filters} 
              onFiltersChange={setFilters}
            />
          )}
          <div className="text-center py-8 text-gray-500">
            No hay entradas en el historial
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          📊 Historial de Propuestas
          <Badge variant="outline" className="ml-auto">
            {filteredEntries.length} entradas
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {showFilters && (
          <ProposalHistoryFilters 
            filters={filters} 
            onFiltersChange={setFilters}
          />
        )}
        
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                {!proposalId && <TableHead>Propuesta</TableHead>}
                <TableHead>Acción</TableHead>
                <TableHead>Detalles</TableHead>
                <TableHead>Usuario</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEntries.map((entry) => {
                const statusChange = getStatusChange(entry)
                const amountChange = getAmountChange(entry)
                
                return (
                  <TableRow key={entry.id}>
                    <TableCell className="text-sm text-gray-500">
                      {formatDate(entry.created_at)}
                    </TableCell>
                    {!proposalId && (
                      <TableCell>
                        <div>
                          <div className="font-medium text-sm">
                            {entry.proposals?.title || 'Sin título'}
                          </div>
                          <div className="text-xs text-gray-500">
                            {entry.proposals?.proposal_number || 'Sin número'}
                          </div>
                        </div>
                      </TableCell>
                    )}
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{getActionIcon(entry.action_type)}</span>
                        <span className="text-sm font-medium">
                          {getActionLabel(entry.action_type)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {statusChange && (
                          <div className="flex items-center gap-2">
                            <Badge className={getStatusColor(statusChange.from)}>
                              {getStatusLabel(statusChange.from)}
                            </Badge>
                            <span>→</span>
                            <Badge className={getStatusColor(statusChange.to)}>
                              {getStatusLabel(statusChange.to)}
                            </Badge>
                          </div>
                        )}
                        {amountChange && (
                          <div className="text-xs text-gray-600 mt-1">
                            Importe: {new Intl.NumberFormat('es-ES', {
                              style: 'currency',
                              currency: 'EUR'
                            }).format(amountChange.from)} → {new Intl.NumberFormat('es-ES', {
                              style: 'currency',
                              currency: 'EUR'
                            }).format(amountChange.to)}
                          </div>
                        )}
                        {entry.details && (
                          <div className="text-xs text-gray-500 mt-1">
                            {entry.details}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {entry.user_id ? 'Usuario' : 'Sistema'}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
