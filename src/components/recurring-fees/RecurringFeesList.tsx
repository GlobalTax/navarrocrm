
import React from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { FileText, Plus, MoreHorizontal, Pause, Play, Pencil, Trash2 } from 'lucide-react'
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

const frequencyLabel: Record<string, string> = {
  monthly: 'Mensual',
  quarterly: 'Trimestral',
  yearly: 'Anual',
}

const statusColor: Record<string, string> = {
  active: 'bg-green-100 text-green-800 border-green-200',
  paused: 'bg-amber-100 text-amber-800 border-amber-200',
  cancelled: 'bg-red-100 text-red-800 border-red-200',
  completed: 'bg-gray-100 text-gray-800 border-gray-200',
}

function getUtilizationColor(pct: number) {
  if (pct > 100) return 'text-red-600'
  if (pct > 80) return 'text-amber-600'
  return 'text-green-600'
}

function getProgressColor(pct: number) {
  if (pct > 100) return '[&>div]:bg-red-500'
  if (pct > 80) return '[&>div]:bg-amber-500'
  return '[&>div]:bg-green-500'
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
      <div className="text-center py-12">
        <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-2 text-sm font-medium">No hay cuotas recurrentes</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          {hasFilters
            ? 'No se encontraron cuotas que coincidan con los filtros.'
            : 'Comienza creando tu primera cuota recurrente.'}
        </p>
        {!hasFilters && (
          <Button className="mt-4 rounded-[10px]" onClick={onNewFee}>
            <Plus className="w-4 h-4 mr-2" />
            Nueva Cuota Recurrente
          </Button>
        )}
      </div>
    )
  }

  return (
    <div className="border border-border rounded-[10px] overflow-hidden bg-card shadow-sm">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/30">
            <TableHead className="w-[180px]">Cliente</TableHead>
            <TableHead>Cuota</TableHead>
            <TableHead className="text-center w-[80px]">Freq.</TableHead>
            <TableHead className="text-right w-[90px]">Importe</TableHead>
            <TableHead className="text-center w-[70px]">Incl.</TableHead>
            <TableHead className="text-center w-[70px]">Usadas</TableHead>
            <TableHead className="w-[160px]">Progreso</TableHead>
            <TableHead className="text-center w-[70px]">Extra</TableHead>
            <TableHead className="text-right w-[90px]">€ Extra</TableHead>
            <TableHead className="text-center w-[80px]">Estado</TableHead>
            <TableHead className="w-[50px]" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {fees.map(fee => {
            const h = hoursMap[fee.id]
            const hasHours = fee.included_hours > 0
            return (
              <TableRow 
                key={fee.id} 
                className="cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => onViewDetails(fee)}
              >
                <TableCell className="font-medium text-sm truncate max-w-[180px]">
                  {fee.client?.name || '—'}
                </TableCell>
                <TableCell className="text-sm">{fee.name}</TableCell>
                <TableCell className="text-center">
                  <span className="text-xs text-muted-foreground">{frequencyLabel[fee.frequency] || fee.frequency}</span>
                </TableCell>
                <TableCell className="text-right font-medium text-sm">
                  €{fee.amount.toFixed(0)}
                </TableCell>
                <TableCell className="text-center text-sm">
                  {hasHours ? `${fee.included_hours}h` : '—'}
                </TableCell>
                <TableCell className="text-center text-sm font-medium">
                  {h ? `${h.hoursUsed}h` : hasHours ? '0h' : '—'}
                </TableCell>
                <TableCell>
                  {hasHours && h ? (
                    <div className="flex items-center gap-2">
                      <Progress 
                        value={Math.min(h.utilizationPercent, 100)} 
                        className={`h-2 flex-1 ${getProgressColor(h.utilizationPercent)}`}
                      />
                      <span className={`text-xs font-medium w-10 text-right ${getUtilizationColor(h.utilizationPercent)}`}>
                        {h.utilizationPercent}%
                      </span>
                    </div>
                  ) : hasHours ? (
                    <div className="flex items-center gap-2">
                      <Progress value={0} className="h-2 flex-1" />
                      <span className="text-xs text-muted-foreground w-10 text-right">0%</span>
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell className={`text-center text-sm ${h && h.extraHours > 0 ? 'text-red-600 font-medium' : ''}`}>
                  {h && h.extraHours > 0 ? `${h.extraHours}h` : '—'}
                </TableCell>
                <TableCell className={`text-right text-sm ${h && h.extraAmount > 0 ? 'text-red-600 font-medium' : ''}`}>
                  {h && h.extraAmount > 0 ? `€${h.extraAmount.toFixed(0)}` : '—'}
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant="outline" className={`text-[10px] px-1.5 py-0.5 ${statusColor[fee.status] || ''}`}>
                    {fee.status === 'active' ? 'Activa' : fee.status === 'paused' ? 'Pausada' : fee.status}
                  </Badge>
                </TableCell>
                <TableCell onClick={e => e.stopPropagation()}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEdit(fee)}>
                        <Pencil className="w-4 h-4 mr-2" /> Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onToggleStatus(fee)}>
                        {fee.status === 'active' ? (
                          <><Pause className="w-4 h-4 mr-2" /> Pausar</>
                        ) : (
                          <><Play className="w-4 h-4 mr-2" /> Activar</>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onDelete(fee)} className="text-red-600">
                        <Trash2 className="w-4 h-4 mr-2" /> Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
