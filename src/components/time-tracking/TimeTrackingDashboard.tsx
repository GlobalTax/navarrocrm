
import React, { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Clock, Calendar, DollarSign, TrendingUp } from 'lucide-react'
import { useTimeEntries } from '@/hooks/useTimeEntries'

export function TimeTrackingDashboard() {
  const { timeEntries } = useTimeEntries()

  // OPTIMIZACIÓN: Memoizar cálculos costosos de estadísticas diarias
  const dailyStats = useMemo(() => {
    const today = new Date()
    const todayEntries = timeEntries.filter(entry => {
      const entryDate = new Date(entry.created_at)
      return entryDate.toDateString() === today.toDateString()
    })

    const todayMinutes = todayEntries.reduce((sum, entry) => sum + entry.duration_minutes, 0)
    const todayHours = Math.floor(todayMinutes / 60)
    const remainingMinutes = todayMinutes % 60

    const billableMinutes = todayEntries
      .filter(entry => entry.is_billable)
      .reduce((sum, entry) => sum + entry.duration_minutes, 0)

    const billableHours = Math.floor(billableMinutes / 60)
    const billableRate = todayMinutes > 0 ? Math.round((billableMinutes / todayMinutes) * 100) : 0

    return {
      todayMinutes,
      todayHours,
      remainingMinutes,
      billableMinutes,
      billableHours,
      billableRate,
      todayEntriesCount: todayEntries.length
    }
  }, [timeEntries])

  // OPTIMIZACIÓN: Memoizar configuración de stats para evitar re-creación
  const stats = useMemo(() => [
    {
      title: 'Tiempo Hoy',
      value: `${dailyStats.todayHours}h ${dailyStats.remainingMinutes}m`,
      icon: Clock,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Horas Facturables',
      value: `${dailyStats.billableHours}h ${Math.floor(dailyStats.billableMinutes % 60)}m`,
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Tasa Facturable',
      value: `${dailyStats.billableRate}%`,
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'Entradas Hoy',
      value: dailyStats.todayEntriesCount.toString(),
      icon: Calendar,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    }
  ], [dailyStats])

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {stats.map((stat, index) => (
        <Card key={index} className="transition-all hover:shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
