
import React from 'react'
import { TableCell, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { formatDate, getStatusColor, getStatusLabel } from '../utils/proposalFormatters'

interface ProposalHistoryEntry {
  id: string
  proposal_id: string
  org_id: string
  user_id: string | null
  action_type: string
  old_value: any
  new_value: any
  details: string | null
  created_at: string
  proposals?: {
    title?: string
    proposal_number?: string
  }
}

interface ProposalHistoryTableRowProps {
  entry: ProposalHistoryEntry
  showProposalColumn: boolean
  getActionLabel: (actionType: string) => string
  getActionIcon: (actionType: string) => string
  getStatusChange: (entry: ProposalHistoryEntry) => { from: string; to: string } | null
  getAmountChange: (entry: ProposalHistoryEntry) => { from: number; to: number } | null
}

export const ProposalHistoryTableRow: React.FC<ProposalHistoryTableRowProps> = ({
  entry,
  showProposalColumn,
  getActionLabel,
  getActionIcon,
  getStatusChange,
  getAmountChange
}) => {
  const statusChange = getStatusChange(entry)
  const amountChange = getAmountChange(entry)

  return (
    <TableRow key={entry.id}>
      <TableCell className="text-sm text-gray-500">
        {formatDate(entry.created_at)}
      </TableCell>
      {showProposalColumn && (
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
}
