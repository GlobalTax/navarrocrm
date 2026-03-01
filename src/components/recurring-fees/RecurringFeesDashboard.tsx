import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Euro, Calendar, AlertCircle, TrendingUp, Clock, FileText, Timer } from 'lucide-react'
import { format, addDays } from 'date-fns'
import { es } from 'date-fns/locale'
import type { RecurringFee } from '@/hooks/useRecurringFees'
import type { RecurringFeeHoursData } from '@/hooks/recurringFees/useRecurringFeeTimeEntries'

interface RecurringFeesDashboardProps {
  fees: RecurringFee[]
  hoursMap?: Record<string, RecurringFeeHoursData>
}

export const RecurringFeesDashboard = ({ fees, hoursMap = {} }: RecurringFeesDashboardProps) => {
  const activeFeesCount = fees.filter(f => f.status === 'active').length
  const overdueFeesCount = fees.filter(f => 
    f.status === 'active' && 
    new Date(f.next_billing_date) < new Date()
  ).length
  
  const upcomingFeesCount = fees.filter(f => 
    f.status === 'active' && 
    new Date(f.next_billing_date) >= new Date() &&
    new Date(f.next_billing_date) <= addDays(new Date(), 7)
  ).length
  
  const automaticFeesCount = fees.filter(f => f.proposal_id).length
  
  const monthlyRevenue = fees
    .filter(f => f.status === 'active')
    .reduce((sum, f) => {
      const multiplier = f.frequency === 'yearly' ? 1/12 : 
                        f.frequency === 'quarterly' ? 1/3 : 1
      return sum + (f.amount * multiplier)
    }, 0)

  const yearlyRevenue = monthlyRevenue * 12

  // Métricas globales de horas
  const totalIncludedHours = Object.values(hoursMap).reduce((sum, h) => sum + h.includedHours, 0)
  const totalUsedHours = Object.values(hoursMap).reduce((sum, h) => sum + h.hoursUsed, 0)
  const totalExtraHours = Object.values(hoursMap).reduce((sum, h) => sum + h.extraHours, 0)
  const totalExtraAmount = Object.values(hoursMap).reduce((sum, h) => sum + h.extraAmount, 0)
  const globalUtilization = totalIncludedHours > 0 ? Math.round((totalUsedHours / totalIncludedHours) * 100) : 0

  const upcomingFees = fees
    .filter(f => 
      f.status === 'active' && 
      new Date(f.next_billing_date) >= new Date() &&
      new Date(f.next_billing_date) <= addDays(new Date(), 7)
    )
    .sort((a, b) => new Date(a.next_billing_date).getTime() - new Date(b.next_billing_date).getTime())
    .slice(0, 5)

  return (
    <div className="space-y-6">
      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Euro className="w-4 h-4 text-green-600" />
              Ingresos Mensuales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              €{monthlyRevenue.toFixed(0)}
            </div>
            <p className="text-xs text-muted-foreground">
              €{yearlyRevenue.toFixed(0)} anuales
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-600" />
              Cuotas Activas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {activeFeesCount}
            </div>
            <p className="text-xs text-muted-foreground">
              De {fees.length} totales
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600" />
              Vencidas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {overdueFeesCount}
            </div>
            <p className="text-xs text-muted-foreground">
              Requieren atención
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <FileText className="w-4 h-4 text-purple-600" />
              Automáticas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {automaticFeesCount}
            </div>
            <p className="text-xs text-muted-foreground">
              Desde propuestas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Métricas de horas globales */}
      {totalIncludedHours > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Timer className="w-5 h-5 text-indigo-600" />
              Utilización de Horas (Periodo Actual)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Incluidas</p>
                <p className="text-xl font-bold">{totalIncludedHours}h</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Consumidas</p>
                <p className="text-xl font-bold">{totalUsedHours}h</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Extra</p>
                <p className={`text-xl font-bold ${totalExtraHours > 0 ? 'text-red-600' : ''}`}>{totalExtraHours}h</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Importe extra</p>
                <p className={`text-xl font-bold ${totalExtraAmount > 0 ? 'text-red-600' : ''}`}>€{totalExtraAmount.toFixed(2)}</p>
              </div>
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <span>Utilización global</span>
                <span className={`font-medium ${globalUtilization > 100 ? 'text-red-600' : globalUtilization > 80 ? 'text-amber-600' : 'text-green-600'}`}>
                  {globalUtilization}%
                </span>
              </div>
              <Progress 
                value={Math.min(globalUtilization, 100)} 
                className={`h-3 ${globalUtilization > 100 ? '[&>div]:bg-red-500' : globalUtilization > 80 ? '[&>div]:bg-amber-500' : '[&>div]:bg-green-500'}`}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Cuotas próximas */}
      {upcomingFees.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-600" />
              Próximas Facturaciones (7 días)
              <Badge className="bg-amber-100 text-amber-800">
                {upcomingFeesCount}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingFees.map((fee) => (
                <div key={fee.id} className="flex items-center justify-between p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium">{fee.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {fee.client?.name}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">
                      €{fee.amount.toFixed(2)}
                    </p>
                    <p className="text-sm text-amber-600">
                      {format(new Date(fee.next_billing_date), 'dd MMM', { locale: es })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Alertas de vencidas */}
      {overdueFeesCount > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2 text-red-700">
              <AlertCircle className="w-5 h-5" />
              Cuotas Vencidas - Atención Requerida
              <Badge className="bg-red-100 text-red-800">
                {overdueFeesCount}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-red-600">
              Hay {overdueFeesCount} cuota(s) recurrente(s) que han pasado su fecha de facturación. 
              Revísalas para generar las facturas correspondientes o ajustar las fechas.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}