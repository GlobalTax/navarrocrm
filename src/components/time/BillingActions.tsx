import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { MoreHorizontal, Receipt, DollarSign, Clock } from 'lucide-react'
import { useTimeEntries, TimeEntry } from '@/hooks/useTimeEntries'
import { toast } from 'sonner'

interface BillingActionsProps {
  timeEntries: TimeEntry[]
}

export const BillingActions = ({ timeEntries }: BillingActionsProps) => {
  const [selectedEntries, setSelectedEntries] = useState<string[]>([])
  const { updateBillingStatus, isUpdatingBilling } = useTimeEntries()

  const unbilledEntries = timeEntries.filter(entry => 
    entry.is_billable && entry.billing_status === 'unbilled'
  )

  const handleSelectAll = () => {
    if (selectedEntries.length === unbilledEntries.length) {
      setSelectedEntries([])
    } else {
      setSelectedEntries(unbilledEntries.map(entry => entry.id))
    }
  }

  const handleSelectEntry = (entryId: string) => {
    setSelectedEntries(prev => 
      prev.includes(entryId)
        ? prev.filter(id => id !== entryId)
        : [...prev, entryId]
    )
  }

  const handleBulkAction = (status: 'billed' | 'invoiced') => {
    if (selectedEntries.length === 0) {
      toast.error('Selecciona al menos una entrada')
      return
    }

    updateBillingStatus({ 
      ids: selectedEntries, 
      status 
    })
    setSelectedEntries([])
  }

  const totalSelectedHours = selectedEntries.reduce((total, entryId) => {
    const entry = timeEntries.find(e => e.id === entryId)
    return total + (entry ? entry.duration_minutes / 60 : 0)
  }, 0)

  if (unbilledEntries.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Receipt className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>No hay entradas de tiempo sin facturar</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border border-border">
        <div className="flex items-center gap-4">
          <Checkbox
            checked={selectedEntries.length === unbilledEntries.length}
            onCheckedChange={handleSelectAll}
          />
          <div>
            <p className="font-medium">
              {selectedEntries.length} de {unbilledEntries.length} entradas seleccionadas
            </p>
            {selectedEntries.length > 0 && (
              <p className="text-sm text-muted-foreground">
                {totalSelectedHours.toFixed(2)} horas • €{(totalSelectedHours * 50).toFixed(2)}
              </p>
            )}
          </div>
        </div>

        {selectedEntries.length > 0 && (
          <div className="flex items-center gap-2">
            <Button 
              onClick={() => handleBulkAction('billed')}
              disabled={isUpdatingBilling}
              variant="outline"
              size="sm"
            >
              <Receipt className="w-4 h-4 mr-2" />
              Marcar como facturado
            </Button>
            <Button 
              onClick={() => handleBulkAction('invoiced')}
              disabled={isUpdatingBilling}
              size="sm"
            >
              <DollarSign className="w-4 h-4 mr-2" />
              Marcar como cobrado
            </Button>
          </div>
        )}
      </div>

      <div className="space-y-2">
        {unbilledEntries.map((entry) => (
          <div 
            key={entry.id}
            className="flex items-center gap-4 p-3 bg-card rounded-lg border border-border hover:bg-accent/50 transition-colors"
          >
            <Checkbox
              checked={selectedEntries.includes(entry.id)}
              onCheckedChange={() => handleSelectEntry(entry.id)}
            />
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium">
                  {(entry.duration_minutes / 60).toFixed(2)}h
                </span>
                <Badge variant="secondary" className="text-xs">
                  {entry.entry_type}
                </Badge>
              </div>
              
              <p className="text-sm text-muted-foreground truncate">
                {entry.description || 'Sin descripción'}
              </p>
              
              {entry.case && (
                <p className="text-xs text-muted-foreground">
                  {entry.case.title} • {entry.case.contact?.name}
                </p>
              )}
            </div>

            <div className="text-right">
              <p className="font-medium">€{((entry.duration_minutes / 60) * 50).toFixed(2)}</p>
              <p className="text-xs text-muted-foreground">
                {new Date(entry.created_at).toLocaleDateString()}
              </p>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem 
                  onClick={() => updateBillingStatus({ ids: [entry.id], status: 'billed' })}
                >
                  <Receipt className="w-4 h-4 mr-2" />
                  Marcar como facturado
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => updateBillingStatus({ ids: [entry.id], status: 'invoiced' })}
                >
                  <DollarSign className="w-4 h-4 mr-2" />
                  Marcar como cobrado
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ))}
      </div>
    </div>
  )
}