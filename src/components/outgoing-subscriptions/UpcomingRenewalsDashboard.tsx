import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { AlertTriangle, Calendar, Clock, ExternalLink } from 'lucide-react'
import { useOutgoingSubscriptionNotifications } from '@/hooks/useOutgoingSubscriptions'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

export const UpcomingRenewalsDashboard = () => {
  const { data: notifications = [] } = useOutgoingSubscriptionNotifications()

  if (notifications.length === 0) {
    return (
      <Card className="bg-green-50 border-0.5 border-green-200 rounded-[10px] shadow-sm">
        <CardHeader>
          <CardTitle className="text-sm font-medium flex items-center gap-2 text-green-700">
            <Calendar className="h-4 w-4" />
            Próximas Renovaciones
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-green-600">
            ✅ No hay renovaciones próximas en los próximos 7 días
          </p>
        </CardContent>
      </Card>
    )
  }

  const formatCurrency = (amount: number, currency: string = 'EUR') => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency
    }).format(amount)
  }

  const getUrgencyColor = (days: number) => {
    if (days <= 1) return 'destructive'
    if (days <= 3) return 'secondary'
    return 'outline'
  }

  const getUrgencyBg = (days: number) => {
    if (days <= 1) return 'bg-red-50 border-red-200'
    if (days <= 3) return 'bg-yellow-50 border-yellow-200'
    return 'bg-blue-50 border-blue-200'
  }

  return (
    <Card className="bg-white border-0.5 border-black rounded-[10px] shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            Próximas Renovaciones ({notifications.length})
          </CardTitle>
          <Button 
            variant="outline" 
            size="sm" 
            className="border-0.5 rounded-[10px]"
          >
            <ExternalLink className="h-3 w-3 mr-1" />
            Ver todas
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {notifications.slice(0, 5).map((notification) => (
            <div 
              key={notification.id} 
              className={`
                flex items-center justify-between p-3 border-0.5 rounded-[10px] 
                ${getUrgencyBg(notification.daysUntilRenewal)}
                hover:shadow-sm transition-all duration-200
              `}
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-medium text-sm">{notification.providerName}</p>
                  <Badge 
                    variant={getUrgencyColor(notification.daysUntilRenewal)}
                    className="text-xs border-0.5 rounded-[10px]"
                  >
                    {notification.daysUntilRenewal === 0 
                      ? 'Hoy' 
                      : notification.daysUntilRenewal === 1 
                        ? 'Mañana'
                        : `${notification.daysUntilRenewal} días`
                    }
                  </Badge>
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-600">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {format(new Date(notification.nextRenewalDate), 'dd MMM yyyy', { locale: es })}
                  </span>
                  <span className="font-medium">
                    {formatCurrency(notification.amount, notification.currency)}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {notification.daysUntilRenewal <= 1 && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="border-0.5 rounded-[10px] text-xs h-7"
                  >
                    Renovar
                  </Button>
                )}
              </div>
            </div>
          ))}
          
          {notifications.length > 5 && (
            <div className="text-center pt-2">
              <p className="text-sm text-gray-600">
                +{notifications.length - 5} renovaciones más...
              </p>
              <Button 
                variant="ghost" 
                size="sm" 
                className="mt-2 text-xs rounded-[10px]"
              >
                Ver todas las renovaciones
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}