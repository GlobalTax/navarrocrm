import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { useOutgoingSubscriptions } from '@/hooks/useOutgoingSubscriptions'
import { SUBSCRIPTION_CATEGORIES } from '@/types/outgoing-subscriptions'

export const SpendingByCategory = () => {
  const { subscriptions, isLoading } = useOutgoingSubscriptions()

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-0.5 border-black rounded-[10px]">
          <CardHeader>
            <div className="h-4 bg-gray-200 rounded animate-pulse" />
          </CardHeader>
          <CardContent>
            <div className="h-48 bg-gray-100 rounded animate-pulse" />
          </CardContent>
        </Card>
        <Card className="border-0.5 border-black rounded-[10px]">
          <CardHeader>
            <div className="h-4 bg-gray-200 rounded animate-pulse" />
          </CardHeader>
          <CardContent>
            <div className="h-48 bg-gray-100 rounded animate-pulse" />
          </CardContent>
        </Card>
      </div>
    )
  }

  // Procesar datos por categoría
  const activeSubscriptions = subscriptions?.filter(sub => sub.status === 'ACTIVE') || []
  
  const categoryData = SUBSCRIPTION_CATEGORIES.map(category => {
    const categorySubscriptions = activeSubscriptions.filter(sub => sub.category === category.value)
    const monthlyTotal = categorySubscriptions
      .filter(sub => sub.billing_cycle === 'MONTHLY')
      .reduce((sum, sub) => sum + sub.amount, 0)
    const yearlyTotal = categorySubscriptions
      .filter(sub => sub.billing_cycle === 'YEARLY')
      .reduce((sum, sub) => sum + (sub.amount / 12), 0) // Convertir a mensual
    
    return {
      category: category.label,
      monthlyAmount: monthlyTotal + yearlyTotal,
      count: categorySubscriptions.length,
      yearlyAmount: (monthlyTotal + yearlyTotal) * 12
    }
  }).filter(item => item.count > 0)

  const totalMonthly = categoryData.reduce((sum, item) => sum + item.monthlyAmount, 0)

  // Datos para gráfico de dona
  const pieData = categoryData.map((item, index) => ({
    ...item,
    percentage: totalMonthly > 0 ? ((item.monthlyAmount / totalMonthly) * 100).toFixed(1) : '0',
    color: `hsl(${(index * 45) % 360}, 65%, 55%)`
  }))

  const chartConfig = {
    monthlyAmount: {
      label: "Gasto Mensual",
      color: "hsl(var(--primary))",
    },
    count: {
      label: "Suscripciones",
      color: "hsl(var(--secondary))",
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Gráfico de Barras por Categoría */}
      <Card className="border-0.5 border-black rounded-[10px] shadow-sm hover:shadow-lg transition-all duration-300">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Gasto Mensual por Categoría</CardTitle>
          <CardDescription>
            Distribución del gasto mensual entre las diferentes categorías de suscripciones
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                <XAxis 
                  dataKey="category" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  interval={0}
                  fontSize={12}
                />
                <YAxis 
                  tickFormatter={(value) => `€${typeof value === 'number' ? value.toFixed(0) : value}`}
                  fontSize={12}
                />
                <ChartTooltip 
                  content={<ChartTooltipContent 
                    labelFormatter={(label) => `Categoría: ${label}`}
                    formatter={(value, name) => [
                      name === 'monthlyAmount' 
                        ? `€${typeof value === 'number' ? value.toFixed(2) : value}/mes` 
                        : `${value} suscripciones`,
                      name === 'monthlyAmount' ? 'Gasto Mensual' : 'Cantidad'
                    ]}
                  />}
                />
                <Bar 
                  dataKey="monthlyAmount" 
                  fill="hsl(var(--primary))"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Gráfico de Dona - Distribución */}
      <Card className="border-0.5 border-black rounded-[10px] shadow-sm hover:shadow-lg transition-all duration-300">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Distribución del Gasto</CardTitle>
          <CardDescription>
            Porcentaje del gasto total mensual por categoría
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center">
            <ChartContainer config={chartConfig} className="flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="monthlyAmount"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <ChartTooltip 
                    content={<ChartTooltipContent 
                      labelFormatter={(label) => `${label}`}
                      formatter={(value, name, props) => [
                        `€${typeof value === 'number' ? value.toFixed(2) : value}/mes (${props.payload.percentage}%)`,
                        'Gasto Mensual'
                      ]}
                    />}
                  />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
            
            {/* Leyenda personalizada */}
            <div className="ml-4 space-y-2">
              {pieData.map((item, index) => (
                <div key={item.category} className="flex items-center gap-2 text-sm">
                  <div 
                    className="w-3 h-3 rounded-full border-0.5 border-black"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="font-medium">{item.category}</span>
                  <span className="text-muted-foreground">{item.percentage}%</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}