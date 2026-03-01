import { useState, useEffect, useRef } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Plus, Clock, Timer, CalendarIcon, ChevronDown, Play, Pause, Square, RotateCcw } from 'lucide-react'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { useCasesList } from '@/features/cases'
import { useTimeEntries } from '@/hooks/useTimeEntries'
import { useRecurringFeesForTimer } from '@/hooks/recurringFees/useRecurringFeesForTimer'
import { useApp } from '@/contexts/AppContext'
import { useActivityTypes } from '@/hooks/useActivityTypes'
import { supabase } from '@/integrations/supabase/client'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'

// Hook para métricas rápidas (hoy / semana / mes)
const useQuickMetrics = () => {
  const { user } = useApp()

  return useQuery({
    queryKey: ['time-quick-metrics', user?.id],
    queryFn: async () => {
      if (!user?.id) return { today: 0, week: 0, month: 0 }

      const now = new Date()
      const todayStr = format(now, 'yyyy-MM-dd')

      const weekStart = new Date(now)
      weekStart.setDate(now.getDate() - now.getDay() + 1) // lunes
      const weekStartStr = format(weekStart, 'yyyy-MM-dd')

      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
      const monthStartStr = format(monthStart, 'yyyy-MM-dd')

      const { data, error } = await supabase
        .from('time_entries')
        .select('duration_minutes, created_at')
        .eq('user_id', user.id)
        .gte('created_at', monthStartStr)

      if (error) throw error

      let today = 0, week = 0, month = 0
      for (const entry of data || []) {
        const d = entry.created_at?.slice(0, 10) || ''
        const mins = entry.duration_minutes || 0
        month += mins
        if (d >= weekStartStr) week += mins
        if (d === todayStr) today += mins
      }

      return {
        today: Math.round((today / 60) * 10) / 10,
        week: Math.round((week / 60) * 10) / 10,
        month: Math.round((month / 60) * 10) / 10,
      }
    },
    enabled: !!user?.id,
  })
}

export const ModernTimer = () => {
  // Modo: manual (por defecto) o cronómetro
  const [mode, setMode] = useState<'manual' | 'timer'>('manual')

  // Estado entrada manual
  const [manualHours, setManualHours] = useState(0)
  const [manualMinutes, setManualMinutes] = useState(30)
  const [entryDate, setEntryDate] = useState<Date>(new Date())

  // Estado compartido
  const [selectedCaseId, setSelectedCaseId] = useState<string>('no-case')
  const [selectedRecurringFeeId, setSelectedRecurringFeeId] = useState<string>('no-fee')
  const [description, setDescription] = useState('')
  
  const [entryType, setEntryType] = useState<string>('billable')
  const [showMoreOptions, setShowMoreOptions] = useState(false)

  // Estado cronómetro
  const [isRunning, setIsRunning] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [seconds, setSeconds] = useState(0)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const { cases } = useCasesList()
  const { createTimeEntry, isCreating } = useTimeEntries()
  const { activeFees } = useRecurringFeesForTimer()
  const { data: metrics } = useQuickMetrics()
  const { availableTypes } = useActivityTypes()

  const handleRecurringFeeChange = (value: string) => {
    setSelectedRecurringFeeId(value)
    if (value !== 'no-fee') {
      setEntryType('billable')
    }
  }

  // Timer logic
  useEffect(() => {
    if (isRunning && !isPaused) {
      intervalRef.current = setInterval(() => {
        setSeconds(prev => prev + 1)
      }, 1000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [isRunning, isPaused])

  const formatTime = (totalSeconds: number) => {
    const h = Math.floor(totalSeconds / 3600)
    const m = Math.floor((totalSeconds % 3600) / 60)
    const s = totalSeconds % 60
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  // Registro manual
  const handleManualRegister = () => {
    const totalMinutes = manualHours * 60 + manualMinutes
    if (totalMinutes === 0) {
      toast.error('Introduce al menos 1 minuto')
      return
    }
    if (!description.trim()) {
      toast.error('Añade una descripción')
      return
    }

    createTimeEntry({
      case_id: selectedCaseId === 'no-case' ? undefined : selectedCaseId,
      description: description.trim(),
      duration_minutes: totalMinutes,
      is_billable: true,
      entry_type: entryType,
      recurring_fee_id: selectedRecurringFeeId === 'no-fee' ? null : selectedRecurringFeeId,
    })

    // Reset
    setManualHours(0)
    setManualMinutes(30)
    setDescription('')
    setSelectedRecurringFeeId('no-fee')
    toast.success(`Registradas ${manualHours}h ${manualMinutes}min`)
  }

  // Registro desde cronómetro
  const handleTimerSave = () => {
    if (seconds === 0) {
      toast.error('No hay tiempo registrado')
      return
    }
    if (!description.trim()) {
      toast.error('Añade una descripción')
      return
    }

    const minutes = Math.max(1, Math.round(seconds / 60))
    createTimeEntry({
      case_id: selectedCaseId === 'no-case' ? undefined : selectedCaseId,
      description: description.trim(),
      duration_minutes: minutes,
      is_billable: true,
      entry_type: entryType,
      recurring_fee_id: selectedRecurringFeeId === 'no-fee' ? null : selectedRecurringFeeId,
    })

    setIsRunning(false)
    setIsPaused(false)
    setSeconds(0)
    setDescription('')
    setSelectedRecurringFeeId('no-fee')
    toast.success(`Registrados ${minutes} minutos`)
  }

  return (
    <Card className="w-full border-[0.5px] border-black rounded-[10px]">
      <CardContent className="p-5">
        {/* Métricas rápidas */}
        <div className="flex items-center gap-6 mb-5">
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-muted-foreground">Hoy</span>
            <span className="text-sm font-semibold">{metrics?.today ?? 0}h</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-muted-foreground">Semana</span>
            <span className="text-sm font-semibold">{metrics?.week ?? 0}h</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-muted-foreground">Mes</span>
            <span className="text-sm font-semibold">{metrics?.month ?? 0}h</span>
          </div>

          {/* Toggle modo */}
          <div className="ml-auto flex items-center gap-1 border-[0.5px] border-black rounded-[10px] p-0.5">
            <Button
              variant={mode === 'manual' ? 'default' : 'ghost'}
              size="sm"
              className="h-7 px-2.5 text-xs rounded-[8px]"
              onClick={() => setMode('manual')}
            >
              <Clock className="h-3 w-3 mr-1" />
              Manual
            </Button>
            <Button
              variant={mode === 'timer' ? 'default' : 'ghost'}
              size="sm"
              className="h-7 px-2.5 text-xs rounded-[8px]"
              onClick={() => setMode('timer')}
            >
              <Timer className="h-3 w-3 mr-1" />
              Cronómetro
            </Button>
          </div>
        </div>

        {/* Formulario principal */}
        <div className="space-y-4">
          {/* Fila 1: Tiempo + Fecha + Caso */}
          <div className="grid grid-cols-1 sm:grid-cols-[auto_auto_1fr_1fr] gap-3 items-end">
            {mode === 'manual' ? (
              <>
                {/* Horas */}
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Horas</Label>
                  <Input
                    type="number"
                    min={0}
                    max={23}
                    value={manualHours}
                    onChange={e => setManualHours(Math.min(23, Math.max(0, parseInt(e.target.value) || 0)))}
                    className="w-20 border-[0.5px] border-black rounded-[10px] text-center font-semibold"
                  />
                </div>
                {/* Minutos */}
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Min</Label>
                  <Input
                    type="number"
                    min={0}
                    max={59}
                    step={5}
                    value={manualMinutes}
                    onChange={e => setManualMinutes(Math.min(59, Math.max(0, parseInt(e.target.value) || 0)))}
                    className="w-20 border-[0.5px] border-black rounded-[10px] text-center font-semibold"
                  />
                </div>
              </>
            ) : (
              <div className="col-span-2 flex items-end gap-2">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Tiempo</Label>
                  <div className="h-9 px-3 flex items-center font-mono font-semibold text-lg border-[0.5px] border-black rounded-[10px] min-w-[140px] justify-center">
                    {formatTime(seconds)}
                  </div>
                </div>
                <div className="flex gap-1 pb-0.5">
                  {!isRunning ? (
                    <Button size="icon" className="h-9 w-9 rounded-[10px]" onClick={() => { setIsRunning(true); setIsPaused(false) }}>
                      <Play className="h-4 w-4" />
                    </Button>
                  ) : !isPaused ? (
                    <Button size="icon" variant="outline" className="h-9 w-9 border-[0.5px] border-black rounded-[10px]" onClick={() => setIsPaused(true)}>
                      <Pause className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button size="icon" className="h-9 w-9 rounded-[10px]" onClick={() => setIsPaused(false)}>
                      <Play className="h-4 w-4" />
                    </Button>
                  )}
                  {(isRunning || seconds > 0) && (
                    <Button size="icon" variant="outline" className="h-9 w-9 border-[0.5px] border-black rounded-[10px]" onClick={() => { setIsRunning(false); setIsPaused(false); setSeconds(0) }}>
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            )}

            {/* Date picker */}
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Fecha</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal border-[0.5px] border-black rounded-[10px] h-9",
                      !entryDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-3.5 w-3.5" />
                    {format(entryDate, 'dd MMM yyyy', { locale: es })}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={entryDate}
                    onSelect={(d) => d && setEntryDate(d)}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Caso / Expediente */}
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Expediente</Label>
              <Select value={selectedCaseId} onValueChange={setSelectedCaseId}>
                <SelectTrigger className="border-[0.5px] border-black rounded-[10px] h-9">
                  <SelectValue placeholder="Sin expediente" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="no-case">Sin expediente</SelectItem>
                  {cases.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Fila 2: Descripción + Botón registrar */}
          <div className="flex gap-3 items-end">
            <div className="flex-1 space-y-1">
              <Label className="text-xs text-muted-foreground">Descripción</Label>
              <Textarea
                placeholder="¿En qué trabajaste?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="resize-none h-9 min-h-[36px] border-[0.5px] border-black rounded-[10px] py-2"
                rows={1}
              />
            </div>
            <Button
              onClick={mode === 'manual' ? handleManualRegister : handleTimerSave}
              disabled={isCreating}
              className="h-9 rounded-[10px] px-4"
            >
              <Plus className="h-4 w-4 mr-1" />
              Registrar
            </Button>
          </div>

          {/* Más opciones */}
          <div className="flex items-center gap-4">

            <Collapsible open={showMoreOptions} onOpenChange={setShowMoreOptions}>
              <CollapsibleTrigger asChild>
                <Button variant="link" size="sm" className="text-xs p-0 h-auto text-muted-foreground">
                  Más opciones
                  <ChevronDown className={cn("h-3 w-3 ml-1 transition-transform", showMoreOptions && "rotate-180")} />
                </Button>
              </CollapsibleTrigger>
            </Collapsible>
          </div>

          {/* Opciones expandibles */}
          <Collapsible open={showMoreOptions} onOpenChange={setShowMoreOptions}>
            <CollapsibleContent className="space-y-3 pt-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Tipo de actividad</Label>
                  <Select value={entryType} onValueChange={setEntryType}>
                    <SelectTrigger className="border-[0.5px] border-black rounded-[10px] h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {availableTypes.map((t) => (
                        <SelectItem key={t.id} value={t.category}>
                          <span className="flex items-center gap-2">
                            {t.color && (
                              <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: t.color }} />
                            )}
                            {t.name}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Cuota recurrente</Label>
                  <Select value={selectedRecurringFeeId} onValueChange={handleRecurringFeeChange}>
                    <SelectTrigger className="border-[0.5px] border-black rounded-[10px] h-9">
                      <SelectValue placeholder="Sin cuota" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="no-fee">Sin cuota</SelectItem>
                      {activeFees.map((fee: any) => (
                        <SelectItem key={fee.id} value={fee.id}>
                          {fee.name} ({fee.included_hours}h)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </CardContent>
    </Card>
  )
}
