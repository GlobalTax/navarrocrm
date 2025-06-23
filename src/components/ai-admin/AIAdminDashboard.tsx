
import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Brain, Zap, TrendingUp, AlertTriangle, DollarSign, Clock } from 'lucide-react'

interface AIAdminDashboardProps {
  stats: {
    totalCalls: number
    totalTokens: number
    totalCost: number
    successRate: number
    avgDuration: number
  }
  isLoading: boolean
}

export function AIAdminDashboard({ stats, isLoading }: AIAdminDashboardProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-8 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const dashboardStats = [
    {
      title: 'Llamadas Totales',
      value: stats.totalCalls.toLocaleString(),
      icon: Brain,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      description: 'Requests procesadas este mes'
    },
    {
      title: 'Tokens Consumidos',
      value: `${(stats.totalTokens / 1000).toFixed(1)}k`,
      icon: Zap,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      description: 'Tokens de entrada y salida'
    },
    {
      title: 'Costo Estimado',
      value: `€${stats.totalCost.toFixed(2)}`,
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      description: 'Gasto en servicios IA'
    },
    {
      title: 'Tasa de Éxito',
      value: `${stats.successRate.toFixed(1)}%`,
      icon: TrendingUp,
      color: stats.successRate > 95 ? 'text-green-600' : stats.successRate > 90 ? 'text-yellow-600' : 'text-red-600',
      bgColor: stats.successRate > 95 ? 'bg-green-50' : stats.successRate > 90 ? 'bg-yellow-50' : 'bg-red-50',
      description: 'Requests exitosas'
    },
    {
      title: 'Tiempo Promedio',
      value: `${(stats.avgDuration / 1000).toFixed(2)}s`,
      icon: Clock,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      description: 'Latencia por request'
    },
    {
      title: 'Estado Sistema',
      value: stats.successRate > 95 ? 'Óptimo' : stats.successRate > 90 ? 'Estable' : 'Atención',
      icon: AlertTriangle,
      color: stats.successRate > 95 ? 'text-green-600' : stats.successRate > 90 ? 'text-yellow-600' : 'text-red-600',
      bgColor: stats.successRate > 95 ? 'bg-green-50' : stats.successRate > 90 ? 'bg-yellow-50' : 'bg-red-50',
      description: 'Salud general del sistema'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
      {dashboardStats.map((stat, index) => (
        <Card key={index} className="transition-all hover:shadow-md">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                  {stat.title === 'Estado Sistema' && (
                    <Badge variant={stats.successRate > 95 ? 'default' : stats.successRate > 90 ? 'secondary' : 'destructive'}>
                      {stat.value}
                    </Badge>
                  )}
                </div>
                {stat.title !== 'Estado Sistema' && (
                  <p className="text-2xl font-bold mb-1">{stat.value}</p>
                )}
                <p className="text-xs text-muted-foreground">{stat.description}</p>
              </div>
              <div className={`p-3 rounded-lg ${stat.bgColor} ml-4`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
