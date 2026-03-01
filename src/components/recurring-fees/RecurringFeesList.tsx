
import React from 'react'
import { Button } from '@/components/ui/button'
import { FileText, Plus } from 'lucide-react'
import { RecurringFeeCard } from './RecurringFeeCard'
import type { RecurringFee } from '@/hooks/useRecurringFees'
import type { RecurringFeeHoursData } from '@/hooks/recurringFees/useRecurringFeeTimeEntries'

interface RecurringFeesListProps {
  fees: RecurringFee[]
  hasFilters: boolean
  hoursMap?: Record<string, RecurringFeeHoursData>
  onEdit: (fee: RecurringFee) => void
  onDelete: (fee: RecurringFee) => void
  onToggleStatus: (fee: RecurringFee) => void
  onViewDetails: (fee: RecurringFee) => void
  onNewFee: () => void
}

export function RecurringFeesList({
  fees,
  hasFilters,
  hoursMap = {},
  onEdit,
  onDelete,
  onToggleStatus,
  onViewDetails,
  onNewFee
}: RecurringFeesListProps) {
  if (fees.length === 0) {
    return (
      <div className="col-span-full text-center py-12">
        <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-2 text-sm font-medium">No hay cuotas recurrentes</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          {hasFilters
            ? 'No se encontraron cuotas que coincidan con los filtros.'
            : 'Comienza creando tu primera cuota recurrente.'}
        </p>
        {!hasFilters && (
          <Button className="mt-4" onClick={onNewFee}>
            <Plus className="w-4 h-4 mr-2" />
            Nueva Cuota Recurrente
          </Button>
        )}
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {fees.map((fee) => (
        <RecurringFeeCard
          key={fee.id}
          recurringFee={fee}
          hoursData={hoursMap[fee.id]}
          onEdit={onEdit}
          onDelete={onDelete}
          onToggleStatus={onToggleStatus}
          onViewDetails={onViewDetails}
        />
      ))}
    </div>
  )
}
