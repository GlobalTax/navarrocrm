import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Users, DollarSign, TrendingUp, AlertTriangle } from 'lucide-react'
import type { SubscriptionStats as StatsType } from '@/types/subscriptions'

interface SubscriptionStatsProps {
  stats: StatsType
}

export const SubscriptionStats: React.FC<SubscriptionStatsProps> = ({ stats }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount)
  }

  const getChurnColor = (rate: number) => {
    if (rate < 5) return 'bg-green-500'
    if (rate < 10) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Total de Suscripciones */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Suscripciones</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalSubscriptions}</div>
          <p className="text-xs text-muted-foreground">
            {stats.activeSubscriptions} activas
          </p>
        </CardContent>
      </Card>

      {/* Ingresos Mensuales */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Ingresos Mensuales</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(stats.monthlyRevenue)}</div>
          <p className="text-xs text-muted-foreground">
            Ingresos recurrentes mensuales
          </p>
        </CardContent>
      </Card>

      {/* Valor Promedio */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Valor Promedio</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(stats.averageSubscriptionValue)}</div>
          <p className="text-xs text-muted-foreground">
            Por suscripción mensual
          </p>
        </CardContent>
      </Card>

      {/* Tasa de Churn */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Tasa de Churn</CardTitle>
          <AlertTriangle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <div className="text-2xl font-bold">{stats.churnRate.toFixed(1)}%</div>
            <Badge 
              variant="secondary" 
              className={`${getChurnColor(stats.churnRate)} text-white text-xs`}
            >
              {stats.churnRate < 5 ? 'Excelente' : stats.churnRate < 10 ? 'Bueno' : 'Atención'}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            Últimos 30 días
          </p>
        </CardContent>
      </Card>
    </div>
  )
}