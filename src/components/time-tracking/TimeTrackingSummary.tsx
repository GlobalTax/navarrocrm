
import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Calendar, Download, Filter } from 'lucide-react'
import { useMonthlyTimeStats } from '@/hooks/useMonthlyTimeStats'
import { format, startOfWeek, endOfWeek, subWeeks, subMonths } from 'date-fns'
import { es } from 'date-fns/locale'

type PeriodType = 'week' | 'month' | 'quarter' | 'custom'

export const TimeTrackingSummary = () => {
  const [periodType, setPeriodType] = useState<PeriodType>('week')
  const [selectedDate, setSelectedDate] = useState(new Date())
  
  // Calcular fechas según el período seleccionado
  const getDateRange = () => {
    const now = new Date()
    switch (periodType) {
      case 'week':
        return {
          start: startOfWeek(selectedDate, { weekStartsOn: 1 }),
          end: endOfWeek(selectedDate, { weekStartsOn: 1 }),
          month: selectedDate.getMonth() + 1,
          year: selectedDate.getFullYear()
        }
      case 'month':
        return {
          start: new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1),
          end: new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0),
          month: selectedDate.getMonth() + 1,
          year: selectedDate.getFullYear()
        }
      case 'quarter':
        const quarter = Math.floor(selectedDate.getMonth() / 3)
        return {
          start: new Date(selectedDate.getFullYear(), quarter * 3, 1),
          end: new Date(selectedDate.getFullYear(), quarter * 3 + 3, 0),
          month: selectedDate.getMonth() + 1,
          year: selectedDate.getFullYear()
        }
      default:
        return {
          start: selectedDate,
          end: selectedDate,
          month: selectedDate.getMonth() + 1,
          year: selectedDate.getFullYear()
        }
    }
  }

  const dateRange = getDateRange()
  const { monthlyStats, monthlySummary, isLoading } = useMonthlyTimeStats(dateRange.month, dateRange.year)

  // Filtrar datos según el rango seleccionado
  const filteredStats = monthlyStats.filter(stat => {
    const statDate = new Date(stat.day_date)
    return statDate >= dateRange.start && statDate <= dateRange.end
  })

  const handlePreviousPeriod = () => {
    switch (periodType) {
      case 'week':
        setSelectedDate(subWeeks(selectedDate, 1))
        break
      case 'month':
        setSelectedDate(subMonths(selectedDate, 1))
        break
      case 'quarter':
        setSelectedDate(subMonths(selectedDate, 3))
        break
    }
  }

  const handleNextPeriod = () => {
    switch (periodType) {
      case 'week':
        setSelectedDate(new Date(selectedDate.getTime() + 7 * 24 * 60 * 60 * 1000))
        break
      case 'month':
        setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 1))
        break
      case 'quarter':
        setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 3, 1))
        break
    }
  }

  const getPeriodLabel = () => {
    switch (periodType) {
      case 'week':
        return `Semana del ${format(dateRange.start, 'd MMM', { locale: es })} al ${format(dateRange.end, 'd MMM yyyy', { locale: es })}`
      case 'month':
        return format(selectedDate, 'MMMM yyyy', { locale: es })
      case 'quarter':
        const quarter = Math.floor(selectedDate.getMonth() / 3) + 1
        return `Q${quarter} ${selectedDate.getFullYear()}`
      default:
        return format(selectedDate, 'd MMMM yyyy', { locale: es })
    }
  }

  const getTotals = () => {
    return filteredStats.reduce((acc, day) => ({
      billable: acc.billable + Number(day.billable_hours),
      office_admin: acc.office_admin + Number(day.office_admin_hours),
      business_dev: acc.business_dev + Number(day.business_dev_hours),
      internal: acc.internal + Number(day.internal_hours),
      total: acc.total + Number(day.total_hours),
      entries: acc.entries + day.entry_count
    }), {
      billable: 0,
      office_admin: 0,
      business_dev: 0,
      internal: 0,
      total: 0,
      entries: 0
    })
  }

  const totals = getTotals()

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
      {/* Controles de Período */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Resumen de Tiempo
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-1" />
                Exportar
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              <Select value={periodType} onValueChange={(value: PeriodType) => setPeriodType(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">Semanal</SelectItem>
                  <SelectItem value="month">Mensual</SelectItem>
                  <SelectItem value="quarter">Trimestral</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handlePreviousPeriod}>
                ←
              </Button>
              <span className="font-medium min-w-48 text-center">
                {getPeriodLabel()}
              </span>
              <Button variant="outline" size="sm" onClick={handleNextPeriod}>
                →
              </Button>
            </div>
          </div>

          {/* Resumen Rápido */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <div className="text-center p-3 bg-green-50 rounded-lg border">
              <p className="text-sm text-muted-foreground">Facturable</p>
              <p className="text-lg font-bold text-green-700">{totals.billable.toFixed(1)}h</p>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg border">
              <p className="text-sm text-muted-foreground">Admin</p>
              <p className="text-lg font-bold text-blue-700">{totals.office_admin.toFixed(1)}h</p>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg border">
              <p className="text-sm text-muted-foreground">Comercial</p>
              <p className="text-lg font-bold text-purple-700">{totals.business_dev.toFixed(1)}h</p>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded-lg border">
              <p className="text-sm text-muted-foreground">Interno</p>
              <p className="text-lg font-bold text-orange-700">{totals.internal.toFixed(1)}h</p>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg border">
              <p className="text-sm text-muted-foreground">Total</p>
              <p className="text-lg font-bold">{totals.total.toFixed(1)}h</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de Horas por Día */}
      <Card>
        <CardHeader>
          <CardTitle>Detalle por Día</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead className="text-right">Facturable</TableHead>
                <TableHead className="text-right">Admin</TableHead>
                <TableHead className="text-right">Comercial</TableHead>
                <TableHead className="text-right">Interno</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-right">Registros</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStats.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No hay datos para el período seleccionado
                  </TableCell>
                </TableRow>
              ) : (
                filteredStats.map((day) => (
                  <TableRow key={day.day_date}>
                    <TableCell className="font-medium">
                      {format(new Date(day.day_date), 'EEEE d MMM', { locale: es })}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant={Number(day.billable_hours) > 0 ? "default" : "secondary"}>
                        {Number(day.billable_hours).toFixed(1)}h
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant={Number(day.office_admin_hours) > 0 ? "default" : "secondary"}>
                        {Number(day.office_admin_hours).toFixed(1)}h
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant={Number(day.business_dev_hours) > 0 ? "default" : "secondary"}>
                        {Number(day.business_dev_hours).toFixed(1)}h
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant={Number(day.internal_hours) > 0 ? "default" : "secondary"}>
                        {Number(day.internal_hours).toFixed(1)}h
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {Number(day.total_hours).toFixed(1)}h
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {day.entry_count}
                    </TableCell>
                  </TableRow>
                ))
              )}
              {filteredStats.length > 0 && (
                <TableRow className="font-semibold bg-muted/50">
                  <TableCell>TOTAL</TableCell>
                  <TableCell className="text-right">{totals.billable.toFixed(1)}h</TableCell>
                  <TableCell className="text-right">{totals.office_admin.toFixed(1)}h</TableCell>
                  <TableCell className="text-right">{totals.business_dev.toFixed(1)}h</TableCell>
                  <TableCell className="text-right">{totals.internal.toFixed(1)}h</TableCell>
                  <TableCell className="text-right">{totals.total.toFixed(1)}h</TableCell>
                  <TableCell className="text-right">{totals.entries}</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
