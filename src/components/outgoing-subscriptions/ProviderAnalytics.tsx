import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from 'recharts'
import { useOutgoingSubscriptions } from '@/hooks/useOutgoingSubscriptions'
import { Badge } from '@/components/ui/badge'
import { Building2, CreditCard, Calendar } from 'lucide-react'

export const ProviderAnalytics = () => {
  const { subscriptions, isLoading } = useOutgoingSubscriptions()

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-0.5 border-black rounded-[10px]">
          <CardHeader>
            <div className="h-4 bg-gray-200 rounded animate-pulse" />
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-gray-100 rounded animate-pulse" />
          </CardContent>
        </Card>
        <Card className="border-0.5 border-black rounded-[10px]">
          <CardHeader>
            <div className="h-4 bg-gray-200 rounded animate-pulse" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1,2,3].map(i => (
                <div key={i} className="h-16 bg-gray-100 rounded animate-pulse" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const activeSubscriptions = subscriptions?.filter(sub => sub.status === 'ACTIVE') || []

  // Agrupar por proveedor
  const providerData = activeSubscriptions.reduce((acc, sub) => {
    if (!acc[sub.provider_name]) {
      acc[sub.provider_name] = {
        provider: sub.provider_name,
        totalMonthly: 0,
        totalYearly: 0,
        subscriptionsCount: 0,
        categories: new Set(),
        billingCycles: []
      }
    }

    const monthly = sub.billing_cycle === 'MONTHLY' ? sub.amount : sub.amount / 12
    acc[sub.provider_name].totalMonthly += monthly
    acc[sub.provider_name].totalYearly += monthly * 12
    acc[sub.provider_name].subscriptionsCount += 1
    acc[sub.provider_name].categories.add(sub.category)
    acc[sub.provider_name].billingCycles.push(sub.billing_cycle)

    return acc
  }, {} as Record<string, any>)

  // Convertir a array y ordenar por gasto
  const sortedProviders = Object.values(providerData)
    .map(provider => ({
      ...provider,
      categories: Array.from(provider.categories),
      avgMonthlyPerSub: provider.totalMonthly / provider.subscriptionsCount
    }))
    .sort((a, b) => b.totalMonthly - a.totalMonthly)

  // Top 10 proveedores para el gráfico
  const chartData = sortedProviders.slice(0, 10)

  // Calcular concentración de gastos (top 3 proveedores)
  const totalSpend = sortedProviders.reduce((sum, p) => sum + p.totalMonthly, 0)
  const top3Concentration = sortedProviders.slice(0, 3)
    .reduce((sum, p) => sum + p.totalMonthly, 0) / totalSpend * 100

  const chartConfig = {
    totalMonthly: {
      label: "Gasto Mensual",
      color: "hsl(var(--primary))",
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Gráfico Principal */}
      <Card className="lg:col-span-2 border-0.5 border-black rounded-[10px] shadow-sm hover:shadow-lg transition-all duration-300">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Top Proveedores por Gasto</CardTitle>
          <CardDescription>
            Ranking de los 10 proveedores con mayor gasto mensual
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 100 }}>
                <XAxis 
                  dataKey="provider" 
                  angle={-45}
                  textAnchor="end"
                  height={100}
                  interval={0}
                  fontSize={11}
                />
                <YAxis 
                  tickFormatter={(value) => `€${typeof value === 'number' ? value.toFixed(0) : value}`}
                  fontSize={12}
                />
                <ChartTooltip 
                  content={<ChartTooltipContent 
                    labelFormatter={(label) => `Proveedor: ${label}`}
                    formatter={(value, name, props) => [
                      `€${typeof value === 'number' ? value.toFixed(2) : value}/mes`,
                      'Gasto Mensual',
                      `${props.payload.subscriptionsCount} suscripciones`,
                      `Categorías: ${props.payload.categories.join(', ')}`
                    ]}
                  />}
                />
                <Bar 
                  dataKey="totalMonthly" 
                  fill="hsl(var(--primary))"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Panel de Insights */}
      <div className="space-y-6">
        {/* Concentración de Gastos */}
        <Card className="border-0.5 border-black rounded-[10px] shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Concentración
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {top3Concentration.toFixed(1)}%
              </div>
              <p className="text-sm text-muted-foreground">
                del gasto en top 3 proveedores
              </p>
            </div>
            
            {/* Dependencias críticas */}
            {sortedProviders[0] && (
              <div className="p-3 bg-orange-50 border border-orange-200 rounded-[8px]">
                <p className="text-sm font-medium text-orange-800">
                  Dependencia crítica
                </p>
                <p className="text-xs text-orange-600">
                  {sortedProviders[0].provider} representa {(sortedProviders[0].totalMonthly / totalSpend * 100).toFixed(1)}% del gasto total
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top 3 Proveedores Detalle */}
        <Card className="border-0.5 border-black rounded-[10px] shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Top 3 Proveedores</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {sortedProviders.slice(0, 3).map((provider, index) => (
              <div key={provider.provider} className="space-y-2">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Badge className={`
                        w-6 h-6 text-xs rounded-full border-0.5 border-black flex items-center justify-center
                        ${index === 0 ? 'bg-yellow-100 text-yellow-800' : ''}
                        ${index === 1 ? 'bg-gray-100 text-gray-800' : ''}
                        ${index === 2 ? 'bg-orange-100 text-orange-800' : ''}
                      `}>
                        {index + 1}
                      </Badge>
                      <span className="font-medium text-sm truncate">
                        {provider.provider}
                      </span>
                    </div>
                    
                    <div className="mt-1 space-y-1">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <CreditCard className="h-3 w-3" />
                        €{provider.totalMonthly.toFixed(0)}/mes
                      </div>
                      
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {provider.subscriptionsCount} suscripción{provider.subscriptionsCount > 1 ? 'es' : ''}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Categorías */}
                <div className="flex flex-wrap gap-1">
                  {provider.categories.slice(0, 2).map((category: string) => (
                    <Badge key={category} className="text-xs bg-gray-100 text-gray-700 border-0.5 border-gray-300 rounded-[6px]">
                      {category}
                    </Badge>
                  ))}
                  {provider.categories.length > 2 && (
                    <Badge className="text-xs bg-gray-100 text-gray-700 border-0.5 border-gray-300 rounded-[6px]">
                      +{provider.categories.length - 2}
                    </Badge>
                  )}
                </div>
                
                {index < 2 && <hr className="border-gray-200" />}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}