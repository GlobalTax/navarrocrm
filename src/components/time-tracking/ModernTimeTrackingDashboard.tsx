
import React, { useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Clock, Target, TrendingUp, Calendar, Award, Zap } from 'lucide-react'
import { useTimeEntries } from '@/hooks/useTimeEntries'

export function ModernTimeTrackingDashboard() {
  const { timeEntries } = useTimeEntries()

  // OPTIMIZACIÓN: Memoizar cálculos complejos de estadísticas
  const timeStats = useMemo(() => {
    const today = new Date()
    const todayEntries = timeEntries.filter(entry => {
      const entryDate = new Date(entry.created_at)
      return entryDate.toDateString() === today.toDateString()
    })

    const todayMinutes = todayEntries.reduce((sum, entry) => sum + entry.duration_minutes, 0)
    const todayHours = (todayMinutes / 60).toFixed(1)
    
    const billableMinutes = todayEntries
      .filter(entry => entry.is_billable)
      .reduce((sum, entry) => sum + entry.duration_minutes, 0)
    const billableHours = (billableMinutes / 60).toFixed(1)
    
    const billableRate = todayMinutes > 0 ? Math.round((billableMinutes / todayMinutes) * 100) : 0
    
    // Objetivo diario (8 horas = 480 minutos)
    const dailyGoalMinutes = 480
    const goalProgress = Math.min((todayMinutes / dailyGoalMinutes) * 100, 100)
    
    // Estadísticas semanales
    const weekStart = new Date(today)
    weekStart.setDate(today.getDate() - today.getDay())
    
    const weekEntries = timeEntries.filter(entry => {
      const entryDate = new Date(entry.created_at)
      return entryDate >= weekStart
    })
    
    const weekMinutes = weekEntries.reduce((sum, entry) => sum + entry.duration_minutes, 0)
    const weekHours = (weekMinutes / 60).toFixed(1)

    return {
      todayHours,
      billableHours,
      billableRate,
      goalProgress,
      weekHours,
      weekMinutes,
      todayEntriesCount: todayEntries.length
    }
  }, [timeEntries])

  // OPTIMIZACIÓN: Memoizar función de color para evitar re-creación
  const getProgressColor = useMemo(() => (progress: number) => {
    if (progress >= 100) return 'bg-green-500'
    if (progress >= 75) return 'bg-blue-500'
    if (progress >= 50) return 'bg-yellow-500'
    return 'bg-gray-300'
  }, [])

  // OPTIMIZACIÓN: Memoizar configuración de stats
  const stats = useMemo(() => [
    {
      title: 'Hoy',
      value: `${timeStats.todayHours}h`,
      target: '8h objetivo',
      progress: timeStats.goalProgress,
      icon: Clock,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      trend: timeStats.goalProgress >= 100 ? '+' : ''
    },
    {
      title: 'Facturable Hoy',
      value: `${timeStats.billableHours}h`,
      target: `${timeStats.billableRate}% del total`,
      progress: timeStats.billableRate,
      icon: Target,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      trend: timeStats.billableRate >= 80 ? '🎯' : ''
    },
    {
      title: 'Esta Semana',
      value: `${timeStats.weekHours}h`,
      target: '40h objetivo',
      progress: Math.min((timeStats.weekMinutes / 2400) * 100, 100), // 40h = 2400m
      icon: Calendar,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      trend: timeStats.weekMinutes > 1800 ? '📈' : '' // Más de 30h
    },
    {
      title: 'Productividad',
      value: timeStats.todayEntriesCount > 0 ? '⭐⭐⭐⭐' : '⭐⭐⭐',
      target: `${timeStats.todayEntriesCount} entradas`,
      progress: Math.min(timeStats.todayEntriesCount * 25, 100),
      icon: Award,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      trend: timeStats.todayEntriesCount >= 4 ? '🔥' : ''
    }
  ], [timeStats])

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {stats.map((stat, index) => (
        <Card key={index} className="overflow-hidden hover:shadow-md transition-all duration-200 border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              {stat.trend && (
                <span className="text-lg">{stat.trend}</span>
              )}
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="crm-widget-label">{stat.title}</span>
                <span className="crm-widget-value">{stat.value}</span>
              </div>
              
              {/* Barra de progreso */}
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-500 ${getProgressColor(stat.progress)}`}
                  style={{ width: `${stat.progress}%` }}
                />
              </div>
              
              <p className="crm-caption">{stat.target}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
