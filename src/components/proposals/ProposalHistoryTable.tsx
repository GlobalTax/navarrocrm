
import React, { useState } from 'react'
import {
  Table,
  TableBody,
} from '@/components/ui/table'
import { useProposalHistory } from '@/hooks/proposals/useProposalHistory'
import { ProposalHistoryFilters } from './ProposalHistoryFilters'
import { ProposalHistoryCard } from './history/ProposalHistoryCard'
import { ProposalHistoryTableHeader } from './history/ProposalHistoryTableHeader'
import { ProposalHistoryTableRow } from './history/ProposalHistoryTableRow'
import { ProposalHistoryEmptyState } from './history/ProposalHistoryEmptyState'

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
      <ProposalHistoryCard title="Historial de Propuestas" entryCount={0}>
        <ProposalHistoryEmptyState message="Cargando historial..." />
      </ProposalHistoryCard>
    )
  }

  if (filteredEntries.length === 0) {
    return (
      <ProposalHistoryCard title="Historial de Propuestas" entryCount={0}>
        {showFilters && (
          <ProposalHistoryFilters 
            filters={filters} 
            onFiltersChange={setFilters}
          />
        )}
        <ProposalHistoryEmptyState message="No hay entradas en el historial" />
      </ProposalHistoryCard>
    )
  }

  return (
    <ProposalHistoryCard title="Historial de Propuestas" entryCount={filteredEntries.length}>
      {showFilters && (
        <ProposalHistoryFilters 
          filters={filters} 
          onFiltersChange={setFilters}
        />
      )}
      
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <ProposalHistoryTableHeader showProposalColumn={!proposalId} />
          <TableBody>
            {filteredEntries.map((entry) => (
              <ProposalHistoryTableRow
                key={entry.id}
                entry={entry}
                showProposalColumn={!proposalId}
                getActionLabel={getActionLabel}
                getActionIcon={getActionIcon}
                getStatusChange={getStatusChange}
                getAmountChange={getAmountChange}
              />
            ))}
          </TableBody>
        </Table>
      </div>
    </ProposalHistoryCard>
  )
}
