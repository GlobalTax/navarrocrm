
import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Clock, Calendar, DollarSign, TrendingUp } from 'lucide-react'
import { useTimeEntries } from '@/features/time-tracking'

export function TimeTrackingDashboard() {
  const { timeEntries } = useTimeEntries()

  // Calcular estadísticas del día
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

  const stats = [
    {
      title: 'Tiempo Hoy',
      value: `${todayHours}h ${remainingMinutes}m`,
      icon: Clock,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Horas Facturables',
      value: `${billableHours}h ${Math.floor(billableMinutes % 60)}m`,
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Tasa Facturable',
      value: `${billableRate}%`,
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'Entradas Hoy',
      value: todayEntries.length.toString(),
      icon: Calendar,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    }
  ]

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
