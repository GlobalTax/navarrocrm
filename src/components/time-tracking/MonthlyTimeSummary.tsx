
import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CalendarDays, Clock, TrendingUp, BarChart3, Calendar, Target } from 'lucide-react'
import { useMonthlyTimeStats } from '@/hooks/useMonthlyTimeStats'

const monthNames = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
]

export const MonthlyTimeSummary = () => {
  const currentDate = new Date()
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear())

  const { monthlyStats, monthlySummary, isLoading } = useMonthlyTimeStats(selectedMonth, selectedYear)

  const getEntryTypeColor = (type: string) => {
    switch (type) {
      case 'billable': return 'bg-green-500'
      case 'office_admin': return 'bg-blue-500'
      case 'business_development': return 'bg-purple-500'
      case 'internal': return 'bg-orange-500'
      default: return 'bg-gray-500'
    }
  }

  const getEntryTypeLabel = (type: string) => {
    switch (type) {
      case 'billable': return 'Facturable'
      case 'office_admin': return 'Admin. Oficina'
      case 'business_development': return 'Desarrollo Negocio'
      case 'internal': return 'Interno'
      default: return type
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Selector de Mes/Año */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Resumen Mensual de Tiempo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Mes:</label>
              <Select value={selectedMonth.toString()} onValueChange={(value) => setSelectedMonth(parseInt(value))}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {monthNames.map((month, index) => (
                    <SelectItem key={index} value={(index + 1).toString()}>
                      {month}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Año:</label>
              <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 5 }, (_, i) => currentDate.getFullYear() - 2 + i).map(year => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="text-center mb-4">
            <h3 className="text-lg font-semibold">
              {monthNames[selectedMonth - 1]} {selectedYear}
            </h3>
          </div>
        </CardContent>
      </Card>

      {/* Métricas Principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Horas</p>
                <p className="text-2xl font-bold">{monthlySummary.totalHours.toFixed(1)}h</p>
              </div>
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Horas Facturables</p>
                <p className="text-2xl font-bold text-green-600">{monthlySummary.billableHours.toFixed(1)}h</p>
              </div>
              <Target className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Tasa Utilización</p>
                <p className="text-2xl font-bold text-purple-600">{monthlySummary.utilizationRate.toFixed(1)}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Días Trabajados</p>
                <p className="text-2xl font-bold">{monthlySummary.workingDays}</p>
              </div>
              <CalendarDays className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Desglose por Tipo */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Desglose por Tipo de Actividad
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-green-50 p-4 rounded-lg border">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 bg-green-500 rounded-full" />
                <span className="text-sm font-medium">Facturable</span>
              </div>
              <p className="text-xl font-bold text-green-700">{monthlySummary.billableHours.toFixed(1)}h</p>
              <p className="text-xs text-green-600">
                {monthlySummary.totalHours > 0 ? ((monthlySummary.billableHours / monthlySummary.totalHours) * 100).toFixed(1) : 0}% del total
              </p>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg border">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full" />
                <span className="text-sm font-medium">Admin. Oficina</span>
              </div>
              <p className="text-xl font-bold text-blue-700">{monthlySummary.officeAdminHours.toFixed(1)}h</p>
              <p className="text-xs text-blue-600">
                {monthlySummary.totalHours > 0 ? ((monthlySummary.officeAdminHours / monthlySummary.totalHours) * 100).toFixed(1) : 0}% del total
              </p>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg border">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 bg-purple-500 rounded-full" />
                <span className="text-sm font-medium">Desarrollo Negocio</span>
              </div>
              <p className="text-xl font-bold text-purple-700">{monthlySummary.businessDevHours.toFixed(1)}h</p>
              <p className="text-xs text-purple-600">
                {monthlySummary.totalHours > 0 ? ((monthlySummary.businessDevHours / monthlySummary.totalHours) * 100).toFixed(1) : 0}% del total
              </p>
            </div>

            <div className="bg-orange-50 p-4 rounded-lg border">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 bg-orange-500 rounded-full" />
                <span className="text-sm font-medium">Interno</span>
              </div>
              <p className="text-xl font-bold text-orange-700">{monthlySummary.internalHours.toFixed(1)}h</p>
              <p className="text-xs text-orange-600">
                {monthlySummary.totalHours > 0 ? ((monthlySummary.internalHours / monthlySummary.totalHours) * 100).toFixed(1) : 0}% del total
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Estadísticas Adicionales */}
      <Card>
        <CardHeader>
          <CardTitle>Estadísticas del Período</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-muted-foreground">Promedio Horas/Día</p>
              <p className="text-xl font-bold">{monthlySummary.avgHoursPerDay.toFixed(1)}h</p>
            </div>
            
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-muted-foreground">Total Entradas</p>
              <p className="text-xl font-bold">{monthlySummary.totalEntries}</p>
            </div>
            
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-muted-foreground">Días con Actividad</p>
              <p className="text-xl font-bold">{monthlySummary.workingDays} días</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
