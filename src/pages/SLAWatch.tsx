import { useEffect, useMemo, useState } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { AlertTriangle, Clock, RefreshCcw } from 'lucide-react'
import { format, formatDistanceToNow, isAfter, isBefore, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import { toast } from 'sonner'

interface TaskItem {
  id: string
  title?: string
  due_date: string | null
  priority?: 'low' | 'medium' | 'high' | 'urgent'
  status?: string
}

const TimeframeFilters = (
  {
    value,
    onChange,
    onRefresh,
    loading
  }: { value: '24h' | '72h' | '7d'; onChange: (v: '24h' | '72h' | '7d') => void; onRefresh: () => void; loading: boolean }
) => (
  <div className="flex items-center justify-between">
    <div className="flex gap-2">
      {(['24h','72h','7d'] as const).map((v) => (
        <Button
          key={v}
          variant={value === v ? 'default' : 'outline'}
          className="border-0.5 border-black rounded-[10px]"
          onClick={() => onChange(v)}
        >
          {v}
        </Button>
      ))}
    </div>
    <Button onClick={onRefresh} disabled={loading} className="border-0.5 border-black rounded-[10px]">
      <RefreshCcw className="h-4 w-4 mr-2" />
      Actualizar
    </Button>
  </div>
)

export default function SLAWatch() {
  const [loading, setLoading] = useState(true)
  const [tasks, setTasks] = useState<TaskItem[]>([])
  const [timeframe, setTimeframe] = useState<'24h' | '72h' | '7d'>('72h')

  useEffect(() => {
    document.title = 'Plazos y SLA | CRM Quantum'
    const metaDesc = document.querySelector('meta[name="description"]') || document.createElement('meta')
    metaDesc.setAttribute('name', 'description')
    metaDesc.setAttribute('content', 'Monitoriza plazos legales y SLA: tareas vencidas y próximas a vencer.')
    if (!metaDesc.parentNode) document.head.appendChild(metaDesc)
  }, [])

  const fetchTasks = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('tasks')
      .select('id, title, due_date, priority, status')
      .order('due_date', { ascending: true })
      .limit(500)

    if (error) {
      toast.error('Error al cargar tareas de SLA')
      setLoading(false)
      return
    }

    setTasks((data || []) as TaskItem[])
    setLoading(false)
  }

  useEffect(() => {
    fetchTasks()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const now = new Date()
  const horizon = useMemo(() => {
    const h = new Date(now)
    if (timeframe === '24h') h.setDate(h.getDate() + 1)
    if (timeframe === '72h') h.setDate(h.getDate() + 3)
    if (timeframe === '7d') h.setDate(h.getDate() + 7)
    return h
  }, [timeframe])

  const enriched = useMemo(() => {
    return tasks
      .filter(t => !!t.due_date)
      .map(t => {
        const due = parseISO(t.due_date as string)
        const isOverdue = isBefore(due, now)
        const withinHorizon = isAfter(horizon, due)
        return { ...t, due, isOverdue, withinHorizon }
      })
  }, [tasks, horizon])

  const stats = useMemo(() => ({
    overdue: enriched.filter(t => t.isOverdue).length,
    dueToday: enriched.filter(t => !t.isOverdue && format(t.due, 'yyyy-MM-dd') === format(now, 'yyyy-MM-dd')).length,
    dueSoon: enriched.filter(t => !t.isOverdue && t.withinHorizon).length
  }), [enriched])

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold">Plazos y SLA</h1>
        <p className="text-muted-foreground">Controla tareas vencidas y próximas a vencer</p>
      </header>

      <TimeframeFilters value={timeframe} onChange={setTimeframe} onRefresh={fetchTasks} loading={loading} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-0.5 border-black rounded-[10px] shadow-sm hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm">Vencidas</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-8 w-16" /> : <div className="text-2xl font-bold">{stats.overdue}</div>}
            <p className="text-xs text-muted-foreground">Requieren acción inmediata</p>
          </CardContent>
        </Card>
        <Card className="border-0.5 border-black rounded-[10px] shadow-sm hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm">Hoy</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-8 w-16" /> : <div className="text-2xl font-bold">{stats.dueToday}</div>}
            <p className="text-xs text-muted-foreground">Vencen en el día</p>
          </CardContent>
        </Card>
        <Card className="border-0.5 border-black rounded-[10px] shadow-sm hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm">Próximos {timeframe}</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-8 w-16" /> : <div className="text-2xl font-bold">{stats.dueSoon}</div>}
            <p className="text-xs text-muted-foreground">Dentro del horizonte seleccionado</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-0.5 border-black rounded-[10px]">
        <CardHeader>
          <CardTitle className="text-base">Detalle de plazos</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-12" />
              ))}
            </div>
          ) : (
            <div className="divide-y">
              {enriched.length === 0 && (
                <p className="text-sm text-muted-foreground">Sin tareas con fecha de vencimiento.</p>
              )}
              {enriched.map(t => (
                <div key={t.id} className="flex items-center justify-between py-3">
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium">{t.title || 'Tarea'}</p>
                    <p className="text-xs text-muted-foreground">Estado: {t.status || '—'} · Prioridad: {t.priority || '—'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm">{format(t.due, 'dd MMM yyyy, HH:mm', { locale: es })}</p>
                    <p className={`text-xs ${t.isOverdue ? 'text-red-600' : 'text-muted-foreground'}`}>
                      {t.isOverdue ? 'Vencida hace ' : 'Vence en '} 
                      {formatDistanceToNow(t.due, { addSuffix: false, locale: es })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
