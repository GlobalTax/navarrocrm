
import React from 'react'
import { TableHead, TableHeader, TableRow } from '@/components/ui/table'

interface ProposalHistoryTableHeaderProps {
  showProposalColumn: boolean
}

export const ProposalHistoryTableHeader: React.FC<ProposalHistoryTableHeaderProps> = ({
  showProposalColumn
}) => {
  return (
    <TableHeader>
      <TableRow>
        <TableHead>Fecha</TableHead>
        {showProposalColumn && <TableHead>Propuesta</TableHead>}
        <TableHead>Acción</TableHead>
        <TableHead>Detalles</TableHead>
        <TableHead>Usuario</TableHead>
      </TableRow>
    </TableHeader>
  )
}
