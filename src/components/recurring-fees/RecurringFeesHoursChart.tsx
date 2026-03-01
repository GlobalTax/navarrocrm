import React, { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  RadialBarChart, RadialBar, Legend
} from 'recharts'
import { Clock, TrendingUp, AlertTriangle } from 'lucide-react'
import { RecurringFeeHoursData } from '@/hooks/recurringFees/useRecurringFeeTimeEntries'

interface RecurringFeesHoursChartProps {
  fees: any[]
  hoursMap: Record<string, RecurringFeeHoursData>
}

const getUtilizationColor = (pct: number) => {
  if (pct > 100) return 'hsl(0 84% 60%)'    // red
  if (pct >= 80) return 'hsl(38 92% 50%)'    // amber
  return 'hsl(142 71% 45%)'                   // green
}

const getUtilizationClass = (pct: number) => {
  if (pct > 100) return 'text-red-600'
  if (pct >= 80) return 'text-amber-600'
  return 'text-green-600'
}

export const RecurringFeesHoursChart: React.FC<RecurringFeesHoursChartProps> = ({ fees, hoursMap }) => {
  const activeFees = useMemo(() =>
    fees.filter(f => f.status === 'active' && f.included_hours > 0),
    [fees]
  )

  const chartData = useMemo(() =>
    activeFees.map(fee => {
      const hours = hoursMap[fee.id]
      return {
        name: fee.client?.name ? `${fee.client.name} - ${fee.name}` : fee.name,
        shortName: fee.name.length > 20 ? fee.name.slice(0, 18) + '…' : fee.name,
        clientName: fee.client?.name || '—',
        included: fee.included_hours,
        used: hours?.hoursUsed ?? 0,
        extra: hours?.extraHours ?? 0,
        extraAmount: hours?.extraAmount ?? 0,
        utilization: hours?.utilizationPercent ?? 0,
        hourlyRateExtra: fee.hourly_rate_extra ?? 0,
      }
    }).sort((a, b) => b.utilization - a.utilization),
    [activeFees, hoursMap]
  )

  // Global summary
  const summary = useMemo(() => {
    const totalIncluded = chartData.reduce((s, d) => s + d.included, 0)
    const totalUsed = chartData.reduce((s, d) => s + d.used, 0)
    const totalExtra = chartData.reduce((s, d) => s + d.extra, 0)
    const totalExtraAmount = chartData.reduce((s, d) => s + d.extraAmount, 0)
    const globalUtilization = totalIncluded > 0 ? Math.round((totalUsed / totalIncluded) * 100) : 0
    return { totalIncluded, totalUsed, totalExtra, totalExtraAmount, globalUtilization }
  }, [chartData])

  const radialData = useMemo(() => [{
    name: 'Utilización',
    value: Math.min(summary.globalUtilization, 100),
    fill: getUtilizationColor(summary.globalUtilization),
  }], [summary])

  if (chartData.length === 0) return null

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null
    const d = payload[0].payload
    return (
      <div className="bg-background border-[0.5px] border-black rounded-[10px] p-3 shadow-lg text-sm">
        <p className="font-semibold mb-1">{d.name}</p>
        <p>Incluidas: <span className="font-medium">{d.included}h</span></p>
        <p>Consumidas: <span className="font-medium">{d.used}h</span></p>
        {d.extra > 0 && (
          <p className="text-red-600">Extra: {d.extra}h (€{d.extraAmount.toFixed(2)})</p>
        )}
        <p className={getUtilizationClass(d.utilization)}>
          Utilización: {d.utilization}%
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Row: Radial summary + Bar chart */}
      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-4">
        {/* Global utilization */}
        <Card className="border-[0.5px] border-black rounded-[10px]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Utilización Global
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center pt-0">
            <ResponsiveContainer width="100%" height={160}>
              <RadialBarChart
                cx="50%" cy="50%" innerRadius="60%" outerRadius="90%"
                startAngle={180} endAngle={0}
                data={radialData}
              >
                <RadialBar dataKey="value" cornerRadius={10} background={{ fill: 'hsl(var(--muted))' }} />
              </RadialBarChart>
            </ResponsiveContainer>
            <div className="text-center -mt-8">
              <span className={`text-3xl font-bold ${getUtilizationClass(summary.globalUtilization)}`}>
                {summary.globalUtilization}%
              </span>
              <p className="text-xs text-muted-foreground mt-1">
                {summary.totalUsed.toFixed(1)}h / {summary.totalIncluded}h
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 w-full mt-4 text-center">
              <div>
                <p className="text-lg font-semibold">{summary.totalExtra.toFixed(1)}h</p>
                <p className="text-xs text-muted-foreground">Horas extra</p>
              </div>
              <div>
                <p className="text-lg font-semibold">€{summary.totalExtraAmount.toFixed(0)}</p>
                <p className="text-xs text-muted-foreground">Importe extra</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bar chart */}
        <Card className="border-[0.5px] border-black rounded-[10px]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Horas Incluidas vs Consumidas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={Math.max(200, chartData.length * 50)}>
              <BarChart data={chartData} layout="vertical" margin={{ left: 10, right: 20, top: 5, bottom: 5 }}>
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis
                  type="category" dataKey="shortName" width={140}
                  tick={{ fontSize: 11 }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="included" name="Incluidas" fill="hsl(142 71% 45%)" radius={[0, 4, 4, 0]} barSize={16} />
                <Bar dataKey="used" name="Consumidas" radius={[0, 4, 4, 0]} barSize={16}>
                  {chartData.map((entry, i) => (
                    <Cell key={i} fill={getUtilizationColor(entry.utilization)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Utilization indicators + table */}
      <Card className="border-[0.5px] border-black rounded-[10px]">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Detalle por Cuota
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-muted text-left text-xs text-muted-foreground">
                  <th className="pb-2 pr-4">Cliente</th>
                  <th className="pb-2 pr-4">Cuota</th>
                  <th className="pb-2 pr-4 text-right">Incluidas</th>
                  <th className="pb-2 pr-4 text-right">Usadas</th>
                  <th className="pb-2 pr-4 text-right">Extra</th>
                  <th className="pb-2 pr-4 text-right">€ Extra</th>
                  <th className="pb-2 min-w-[140px]">Utilización</th>
                </tr>
              </thead>
              <tbody>
                {chartData.map((row, i) => (
                  <tr key={i} className="border-b border-muted/50 last:border-0">
                    <td className="py-2 pr-4 font-medium">{row.clientName}</td>
                    <td className="py-2 pr-4">{row.shortName}</td>
                    <td className="py-2 pr-4 text-right">{row.included}h</td>
                    <td className="py-2 pr-4 text-right">{row.used}h</td>
                    <td className={`py-2 pr-4 text-right ${row.extra > 0 ? 'text-red-600 font-medium' : ''}`}>
                      {row.extra > 0 ? `${row.extra}h` : '—'}
                    </td>
                    <td className={`py-2 pr-4 text-right ${row.extraAmount > 0 ? 'text-red-600 font-medium' : ''}`}>
                      {row.extraAmount > 0 ? `€${row.extraAmount.toFixed(2)}` : '—'}
                    </td>
                    <td className="py-2">
                      <div className="flex items-center gap-2">
                        <Progress
                          value={Math.min(row.utilization, 100)}
                          className="h-2 flex-1"
                          style={{
                            '--progress-color': getUtilizationColor(row.utilization),
                          } as React.CSSProperties}
                        />
                        <span className={`text-xs font-semibold w-10 text-right ${getUtilizationClass(row.utilization)}`}>
                          {row.utilization}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
