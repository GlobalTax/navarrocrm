import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { SpendingByCategory } from './SpendingByCategory'
import { ExpenseTimeline } from './ExpenseTimeline'
import { ProviderAnalytics } from './ProviderAnalytics'
import { useOutgoingSubscriptionStats } from '@/hooks/useOutgoingSubscriptions'
import { TrendingUp, DollarSign, Calendar, AlertTriangle } from 'lucide-react'

export const OutgoingSubscriptionAnalytics = () => {
  const { data: stats, isLoading } = useOutgoingSubscriptionStats()

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => (
            <Card key={i} className="border-0.5 border-black rounded-[10px]">
              <CardContent className="p-4">
                <div className="h-16 bg-gray-100 rounded animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  const formatCurrency = (amount: number) => 
    new Intl.NumberFormat('es-ES', { 
      style: 'currency', 
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)

  // Calcular métricas adicionales
  const monthlyBudgetUsage = stats ? (stats.monthlyTotal / 10000) * 100 : 0 // Asumiendo presupuesto de 10k
  const yearlyProjection = stats ? stats.monthlyTotal * 12 : 0
  const avgSubscriptionCost = stats && stats.activeSubscriptions > 0 
    ? stats.monthlyTotal / stats.activeSubscriptions 
    : 0

  return (
    <div className="space-y-8">
      {/* Métricas clave mejoradas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-0.5 border-black rounded-[10px] shadow-sm hover:shadow-lg transition-all duration-300">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Gasto Mensual</p>
                <p className="text-2xl font-bold text-primary">
                  {formatCurrency(stats?.monthlyTotal || 0)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Proyección anual: {formatCurrency(yearlyProjection)}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0.5 border-black rounded-[10px] shadow-sm hover:shadow-lg transition-all duration-300">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Promedio por Suscripción</p>
                <p className="text-2xl font-bold text-secondary">
                  {formatCurrency(avgSubscriptionCost)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats?.activeSubscriptions || 0} suscripciones activas
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-secondary" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0.5 border-black rounded-[10px] shadow-sm hover:shadow-lg transition-all duration-300">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Próximas Renovaciones</p>
                <p className="text-2xl font-bold text-orange-600">
                  {stats?.upcomingRenewals || 0}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  En los próximos 7 días
                </p>
              </div>
              <Calendar className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0.5 border-black rounded-[10px] shadow-sm hover:shadow-lg transition-all duration-300">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Uso de Presupuesto</p>
                <p className="text-2xl font-bold text-red-600">
                  {monthlyBudgetUsage.toFixed(1)}%
                </p>
                <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                  <div 
                    className="bg-red-600 h-1.5 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(monthlyBudgetUsage, 100)}%` }}
                  />
                </div>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficas por categoría */}
      <div>
        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-2">Análisis por Categoría</h3>
          <p className="text-muted-foreground">
            Desglose detallado del gasto mensual y distribución por categorías de suscripciones
          </p>
        </div>
        <SpendingByCategory />
      </div>

      {/* Timeline de gastos */}
      <div>
        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-2">Evolución Temporal</h3>
          <p className="text-muted-foreground">
            Análisis de tendencias y proyecciones de gasto a lo largo del tiempo
          </p>
        </div>
        <ExpenseTimeline />
      </div>

      {/* Análisis de proveedores */}
      <div>
        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-2">Análisis de Proveedores</h3>
          <p className="text-muted-foreground">
            Identificación de dependencias críticas y concentración de gastos por proveedor
          </p>
        </div>
        <ProviderAnalytics />
      </div>
    </div>
  )
}