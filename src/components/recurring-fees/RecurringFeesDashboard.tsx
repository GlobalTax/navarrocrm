
import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Euro, Calendar, AlertCircle, Timer } from 'lucide-react'
import { addDays } from 'date-fns'
import type { RecurringFee } from '@/hooks/useRecurringFees'
import type { RecurringFeeHoursData } from '@/hooks/recurringFees/useRecurringFeeTimeEntries'

interface RecurringFeesDashboardProps {
  fees: RecurringFee[]
  hoursMap?: Record<string, RecurringFeeHoursData>
}

export const RecurringFeesDashboard = ({ fees, hoursMap = {} }: RecurringFeesDashboardProps) => {
  const activeFeesCount = fees.filter(f => f.status === 'active').length
  const overdueFeesCount = fees.filter(f => 
    f.status === 'active' && new Date(f.next_billing_date) < new Date()
  ).length

  const monthlyRevenue = fees
    .filter(f => f.status === 'active')
    .reduce((sum, f) => {
      const multiplier = f.frequency === 'yearly' ? 1/12 : f.frequency === 'quarterly' ? 1/3 : 1
      return sum + (f.amount * multiplier)
    }, 0)

  const totalUsedHours = Object.values(hoursMap).reduce((sum, h) => sum + h.hoursUsed, 0)
  const totalIncludedHours = Object.values(hoursMap).reduce((sum, h) => sum + h.includedHours, 0)
  const globalUtilization = totalIncludedHours > 0 ? Math.round((totalUsedHours / totalIncludedHours) * 100) : 0

  const metrics = [
    {
      icon: Euro,
      label: 'MRR',
      value: `€${monthlyRevenue.toFixed(0)}`,
      sub: `€${(monthlyRevenue * 12).toFixed(0)}/año`,
      color: 'text-green-600',
    },
    {
      icon: Calendar,
      label: 'Activas',
      value: activeFeesCount,
      sub: `${fees.length} totales`,
      color: 'text-blue-600',
    },
    {
      icon: AlertCircle,
      label: 'Vencidas',
      value: overdueFeesCount,
      sub: overdueFeesCount > 0 ? 'Requieren atención' : 'Todo al día',
      color: overdueFeesCount > 0 ? 'text-red-600' : 'text-muted-foreground',
    },
    {
      icon: Timer,
      label: 'Utilización',
      value: totalIncludedHours > 0 ? `${globalUtilization}%` : '—',
      sub: totalIncludedHours > 0 ? `${totalUsedHours}h / ${totalIncludedHours}h` : 'Sin horas',
      color: globalUtilization > 100 ? 'text-red-600' : globalUtilization > 80 ? 'text-amber-600' : 'text-green-600',
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {metrics.map(m => (
        <Card key={m.label} className="border-border rounded-[10px] shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <m.icon className={`w-5 h-5 shrink-0 ${m.color}`} />
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">{m.label}</p>
              <p className={`text-lg font-bold leading-tight ${m.color}`}>{m.value}</p>
              <p className="text-[11px] text-muted-foreground truncate">{m.sub}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
