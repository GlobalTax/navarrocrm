
import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Clock, Plus } from 'lucide-react'
import { useTimeEntries } from '@/hooks/useTimeEntries'
import { useQueryClient } from '@tanstack/react-query'
import type { RecurringFee } from '@/hooks/useRecurringFees'

interface QuickTimeEntryProps {
  fees: RecurringFee[]
}

export function QuickTimeEntry({ fees }: QuickTimeEntryProps) {
  const [hours, setHours] = useState('')
  const [minutes, setMinutes] = useState('')
  const [selectedFeeId, setSelectedFeeId] = useState('')
  const [description, setDescription] = useState('')
  const { createTimeEntry, isCreating } = useTimeEntries()
  const queryClient = useQueryClient()

  const activeFees = fees.filter(f => f.status === 'active')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const totalMinutes = (parseInt(hours) || 0) * 60 + (parseInt(minutes) || 0)
    if (totalMinutes <= 0 || !selectedFeeId) return

    createTimeEntry({
      duration_minutes: totalMinutes,
      description: description || undefined,
      is_billable: true,
      entry_type: 'billable',
      recurring_fee_id: selectedFeeId,
    }, {
      onSuccess: () => {
        setHours('')
        setMinutes('')
        setDescription('')
        queryClient.invalidateQueries({ queryKey: ['all-recurring-fees-hours'] })
      }
    })
  }

  const totalMinutes = (parseInt(hours) || 0) * 60 + (parseInt(minutes) || 0)
  const canSubmit = totalMinutes > 0 && !!selectedFeeId && !isCreating

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-3 p-4 bg-card border border-border rounded-[10px] shadow-sm">
      <Clock className="w-5 h-5 text-muted-foreground shrink-0" />
      
      <div className="flex items-center gap-1.5">
        <Input
          type="number"
          min="0"
          max="23"
          placeholder="0"
          value={hours}
          onChange={e => setHours(e.target.value)}
          className="w-16 text-center border-border rounded-[10px]"
        />
        <span className="text-sm text-muted-foreground">h</span>
        <Input
          type="number"
          min="0"
          max="59"
          placeholder="0"
          value={minutes}
          onChange={e => setMinutes(e.target.value)}
          className="w-16 text-center border-border rounded-[10px]"
        />
        <span className="text-sm text-muted-foreground">min</span>
      </div>

      <Select value={selectedFeeId} onValueChange={setSelectedFeeId}>
        <SelectTrigger className="w-[260px] border-border rounded-[10px]">
          <SelectValue placeholder="Seleccionar cuota..." />
        </SelectTrigger>
        <SelectContent>
          {activeFees.map(fee => (
            <SelectItem key={fee.id} value={fee.id}>
              {fee.client?.name ? `${fee.client.name} — ` : ''}{fee.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Input
        placeholder="Descripción breve..."
        value={description}
        onChange={e => setDescription(e.target.value)}
        className="flex-1 min-w-[160px] border-border rounded-[10px]"
      />

      <Button 
        type="submit" 
        disabled={!canSubmit}
        className="shrink-0 rounded-[10px]"
      >
        <Plus className="w-4 h-4 mr-1.5" />
        Registrar
      </Button>
    </form>
  )
}
