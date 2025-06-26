
import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, Building2, Clock, Euro } from 'lucide-react'

export const DealsMetrics = () => {
  // Datos mock - en producción vendrían de la API
  const metrics = {
    totalDeals: 12,
    totalValue: 45600000,
    avgDealSize: 3800000,
    avgTimeToClose: 89,
    activeDueDigence: 4,
    closingThisMonth: 2
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Deals Activos
          </CardTitle>
          <Building2 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.totalDeals}</div>
          <p className="text-xs text-muted-foreground">
            +2 desde el mes pasado
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Valor Total Pipeline
          </CardTitle>
          <Euro className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(metrics.totalValue)}</div>
          <p className="text-xs text-muted-foreground">
            Promedio: {formatCurrency(metrics.avgDealSize)}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Due Diligence Activos
          </CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.activeDueDigence}</div>
          <p className="text-xs text-muted-foreground">
            Promedio {metrics.avgTimeToClose} días para cerrar
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Closing Este Mes
          </CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.closingThisMonth}</div>
          <p className="text-xs text-muted-foreground">
            {formatCurrency(12500000)} valor estimado
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
