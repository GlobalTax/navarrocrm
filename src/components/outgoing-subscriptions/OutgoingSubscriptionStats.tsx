import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  DollarSign, 
  TrendingUp, 
  Calendar, 
  Building2,
  AlertTriangle,
  Activity
} from 'lucide-react'
import { useOutgoingSubscriptionStats, useOutgoingSubscriptionNotifications } from '@/hooks/useOutgoingSubscriptions'

export const OutgoingSubscriptionStats = () => {
  const { data: stats, isLoading } = useOutgoingSubscriptionStats()
  const { data: notifications = [] } = useOutgoingSubscriptionNotifications()

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="bg-white border-0.5 border-black rounded-[10px] shadow-sm animate-pulse">
            <CardContent className="p-6">
              <div className="h-16 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!stats) return null

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount)
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Suscripciones */}
      <Card className="bg-white border-0.5 border-black rounded-[10px] shadow-sm hover:shadow-lg transition-all duration-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Suscripciones</CardTitle>
          <Building2 className="h-4 w-4 text-gray-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalSubscriptions}</div>
          <div className="flex items-center gap-2">
            <p className="text-xs text-gray-600">
              {stats.activeSubscriptions} activas
            </p>
            <Badge variant="secondary" className="text-xs border-0.5 rounded-[10px]">
              {stats.activeSubscriptions > 0 
                ? Math.round((stats.activeSubscriptions / stats.totalSubscriptions) * 100)
                : 0}%
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Gasto Mensual */}
      <Card className="bg-white border-0.5 border-black rounded-[10px] shadow-sm hover:shadow-lg transition-all duration-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Gasto Mensual</CardTitle>
          <DollarSign className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(stats.monthlyTotal)}</div>
          <p className="text-xs text-gray-600">
            Promedio: {formatCurrency(stats.averageMonthlyAmount)}
          </p>
        </CardContent>
      </Card>

      {/* Gasto Anual */}
      <Card className="bg-white border-0.5 border-black rounded-[10px] shadow-sm hover:shadow-lg transition-all duration-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Gasto Anual</CardTitle>
          <TrendingUp className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(stats.yearlyTotal)}</div>
          <p className="text-xs text-gray-600">
            Proyección basada en gastos actuales
          </p>
        </CardContent>
      </Card>

      {/* Renovaciones Próximas */}
      <Card className="bg-white border-0.5 border-black rounded-[10px] shadow-sm hover:shadow-lg transition-all duration-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Renovaciones Próximas</CardTitle>
          <Calendar className="h-4 w-4 text-orange-600" />
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <div className="text-2xl font-bold">{notifications.length}</div>
            {notifications.length > 0 && (
              <Badge variant="destructive" className="border-0.5 rounded-[10px]">
                <AlertTriangle className="h-3 w-3 mr-1" />
                Acción requerida
              </Badge>
            )}
          </div>
          <p className="text-xs text-gray-600">
            Próximos 7 días
          </p>
        </CardContent>
      </Card>

      {/* Detalles de notificaciones si hay */}
      {notifications.length > 0 && (
        <Card className="bg-orange-50 border-0.5 border-orange-200 rounded-[10px] shadow-sm md:col-span-2 lg:col-span-4">
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              Renovaciones esta semana
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {notifications.slice(0, 3).map((notification) => (
                <div 
                  key={notification.id} 
                  className="flex items-center justify-between p-3 bg-white border-0.5 border-orange-200 rounded-[10px]"
                >
                  <div>
                    <p className="font-medium">{notification.providerName}</p>
                    <p className="text-sm text-gray-600">
                      {formatCurrency(notification.amount)} en {notification.daysUntilRenewal} días
                    </p>
                  </div>
                  <Badge variant="outline" className="border-0.5 rounded-[10px]">
                    {notification.daysUntilRenewal === 0 ? 'Hoy' : `${notification.daysUntilRenewal}d`}
                  </Badge>
                </div>
              ))}
              {notifications.length > 3 && (
                <p className="text-sm text-gray-600 text-center pt-2">
                  +{notifications.length - 3} más...
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}