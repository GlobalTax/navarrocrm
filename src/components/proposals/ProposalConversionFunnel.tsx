
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useApp } from '@/contexts/AppContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { Target, Clock, TrendingUp } from 'lucide-react'
import { differenceInDays } from 'date-fns'

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  draft: { label: 'Borrador', color: 'hsl(var(--muted-foreground))' },
  sent: { label: 'Enviada', color: 'hsl(var(--chart-1))' },
  negotiating: { label: 'Negociando', color: 'hsl(var(--chart-4))' },
  won: { label: 'Ganada', color: 'hsl(var(--chart-2))' },
  lost: { label: 'Perdida', color: 'hsl(var(--destructive))' },
}

export function ProposalConversionFunnel() {
  const { user } = useApp()

  const { data: proposals, isLoading } = useQuery({
    queryKey: ['proposals-funnel', user?.org_id],
    queryFn: async () => {
      if (!user?.org_id) return []
      const { data, error } = await supabase
        .from('proposals')
        .select('id, status, total_amount, created_at, accepted_at')
        .eq('org_id', user.org_id)
      if (error) throw error
      return data || []
    },
    enabled: !!user?.org_id,
  })

  if (isLoading) {
    return (
      <div className="space-y-4 mt-6">
        <Skeleton className="h-64 w-full" />
        <div className="grid gap-4 md:grid-cols-3">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
      </div>
    )
  }

  if (!proposals || proposals.length === 0) return null

  // Conteos por estado
  const statusOrder = ['draft', 'sent', 'negotiating', 'won', 'lost']
  const counts: Record<string, number> = {}
  statusOrder.forEach(s => { counts[s] = 0 })
  proposals.forEach(p => {
    if (counts[p.status] !== undefined) counts[p.status]++
  })

  const chartData = statusOrder.map(s => ({
    name: STATUS_CONFIG[s]?.label || s,
    value: counts[s],
    status: s,
  }))

  // KPIs
  const won = proposals.filter(p => p.status === 'won')
  const lost = proposals.filter(p => p.status === 'lost')
  const closedTotal = won.length + lost.length
  const closeRate = closedTotal > 0 ? (won.length / closedTotal) * 100 : 0

  const avgDaysToClose = won.length > 0
    ? won.reduce((acc, p) => {
        const days = p.accepted_at
          ? differenceInDays(new Date(p.accepted_at), new Date(p.created_at))
          : 0
        return acc + days
      }, 0) / won.length
    : 0

  const openStatuses = ['draft', 'sent', 'negotiating']
  const pipelineValue = proposals
    .filter(p => openStatuses.includes(p.status))
    .reduce((acc, p) => acc + (p.total_amount || 0), 0)

  return (
    <div className="space-y-4 mt-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Embudo de Conversión</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData} layout="vertical" margin={{ left: 20, right: 20 }}>
              <XAxis type="number" allowDecimals={false} />
              <YAxis type="category" dataKey="name" width={90} tick={{ fontSize: 13 }} />
              <Tooltip formatter={(value: number) => [value, 'Propuestas']} />
              <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                {chartData.map((entry) => (
                  <Cell key={entry.status} fill={STATUS_CONFIG[entry.status]?.color || '#999'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasa de Cierre</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{closeRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">{won.length} ganadas / {closedTotal} cerradas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tiempo Medio Cierre</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(avgDaysToClose)} días</div>
            <p className="text-xs text-muted-foreground">Desde creación hasta aceptación</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pipeline Abierto</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{pipelineValue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Borrador + Enviada + Negociando</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
