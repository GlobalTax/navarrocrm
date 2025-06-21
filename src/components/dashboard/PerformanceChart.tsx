
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from 'recharts'

// Datos de ejemplo para el gráfico
const chartData = [
  { month: 'Ene', horas: 120, facturado: 95 },
  { month: 'Feb', horas: 145, facturado: 110 },
  { month: 'Mar', horas: 160, facturado: 125 },
  { month: 'Abr', horas: 135, facturado: 108 },
  { month: 'May', horas: 175, facturado: 140 },
  { month: 'Jun', horas: 180, facturado: 150 }
]

const chartConfig = {
  horas: {
    label: 'Horas Registradas',
    color: '#0061FF'
  },
  facturado: {
    label: 'Horas Facturadas',
    color: '#2CBD6E'
  }
}

export const PerformanceChart = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Rendimiento Mensual</CardTitle>
        <p className="text-sm text-muted-foreground">
          Comparación entre horas registradas y facturadas
        </p>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
              <XAxis 
                dataKey="month" 
                axisLine={false}
                tickLine={false}
                className="text-xs"
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                className="text-xs"
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar 
                dataKey="horas" 
                fill="var(--color-horas)" 
                radius={[2, 2, 0, 0]}
                className="opacity-80"
              />
              <Bar 
                dataKey="facturado" 
                fill="var(--color-facturado)" 
                radius={[2, 2, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
        <div className="flex items-center justify-center gap-6 mt-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#0061FF] opacity-80"></div>
            <span className="text-muted-foreground">Horas Registradas</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#2CBD6E]"></div>
            <span className="text-muted-foreground">Horas Facturadas</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
