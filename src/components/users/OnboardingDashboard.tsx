import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { supabase } from '@/integrations/supabase/client'
import { useApp } from '@/contexts/AppContext'
import { 
  Users, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  TrendingUp,
  Calendar,
  Search,
  Filter
} from 'lucide-react'
import { format, subDays, isAfter, isBefore } from 'date-fns'
import { es } from 'date-fns/locale'

interface OnboardingStats {
  total: number
  pending: number
  in_progress: number
  completed: number
  expired: number
  expiring_soon: number
  avg_completion_time: number
  completion_rate: number
}

interface OnboardingFilters {
  status: string
  department: string
  date_range: string
  search: string
}

export const OnboardingDashboard = () => {
  const { user } = useApp()
  const [filters, setFilters] = useState<OnboardingFilters>({
    status: 'all',
    department: 'all',
    date_range: '30',
    search: ''
  })

  // Obtener estadísticas
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['onboarding-stats', user?.org_id, filters],
    queryFn: async (): Promise<OnboardingStats> => {
      if (!user?.org_id) throw new Error('No org_id')
      
      let query = supabase
        .from('employee_onboarding')
        .select('*')
        .eq('org_id', user.org_id)

      // Aplicar filtros de fecha
      if (filters.date_range !== 'all') {
        const daysAgo = parseInt(filters.date_range)
        const startDate = subDays(new Date(), daysAgo).toISOString()
        query = query.gte('created_at', startDate)
      }

      const { data: onboardings, error } = await query
      if (error) throw error

      const now = new Date()
      const expiringSoonThreshold = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000) // 3 días

      const stats = onboardings.reduce((acc, onboarding) => {
        acc.total++
        acc[onboarding.status as keyof OnboardingStats]++

        // Contar los que expiran pronto
        const expiresAt = new Date(onboarding.expires_at)
        if (onboarding.status === 'pending' && isAfter(expiresAt, now) && isBefore(expiresAt, expiringSoonThreshold)) {
          acc.expiring_soon++
        }

        // Calcular tiempo de completado para los completados
        if (onboarding.status === 'completed' && onboarding.completed_at) {
          const createdAt = new Date(onboarding.created_at)
          const completedAt = new Date(onboarding.completed_at)
          const completionTime = (completedAt.getTime() - createdAt.getTime()) / (1000 * 60 * 60) // horas
          acc.completion_times = acc.completion_times || []
          acc.completion_times.push(completionTime)
        }

        return acc
      }, {
        total: 0,
        pending: 0,
        in_progress: 0,
        completed: 0,
        expired: 0,
        expiring_soon: 0,
        completion_times: [] as number[]
      })

      // Calcular promedios
      const avgCompletionTime = stats.completion_times.length > 0 
        ? stats.completion_times.reduce((a, b) => a + b, 0) / stats.completion_times.length
        : 0

      const completionRate = stats.total > 0 ? (stats.completed / stats.total) * 100 : 0

      return {
        ...stats,
        avg_completion_time: avgCompletionTime,
        completion_rate: completionRate
      }
    },
    enabled: !!user?.org_id
  })

  // Obtener departamentos para filtros
  const { data: departments = [] } = useQuery({
    queryKey: ['departments', user?.org_id],
    queryFn: async () => {
      if (!user?.org_id) return []
      const { data, error } = await supabase
        .from('departments')
        .select('*')
        .eq('org_id', user.org_id)
        .eq('is_active', true)
        .order('name')
      
      if (error) throw error
      return data
    },
    enabled: !!user?.org_id
  })

  // Obtener onboardings próximos a expirar
  const { data: expiring = [] } = useQuery({
    queryKey: ['onboarding-expiring', user?.org_id],
    queryFn: async () => {
      if (!user?.org_id) return []
      
      const now = new Date()
      const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000)
      
      const { data, error } = await supabase
        .from('employee_onboarding')
        .select(`
          *,
          department:departments(name)
        `)
        .eq('org_id', user.org_id)
        .eq('status', 'pending')
        .gte('expires_at', now.toISOString())
        .lte('expires_at', threeDaysFromNow.toISOString())
        .order('expires_at', { ascending: true })
      
      if (error) throw error
      return data
    },
    enabled: !!user?.org_id
  })

  const formatDuration = (hours: number) => {
    if (hours < 24) {
      return `${Math.round(hours)}h`
    }
    const days = Math.floor(hours / 24)
    const remainingHours = Math.round(hours % 24)
    return `${days}d ${remainingHours}h`
  }

  if (statsLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-8 bg-muted rounded mb-2"></div>
                <div className="h-4 bg-muted rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros de Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Buscar</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Email o puesto..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="pl-9"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Estado</label>
              <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="pending">Pendiente</SelectItem>
                  <SelectItem value="in_progress">En Progreso</SelectItem>
                  <SelectItem value="completed">Completado</SelectItem>
                  <SelectItem value="expired">Expirado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Departamento</label>
              <Select value={filters.department} onValueChange={(value) => setFilters(prev => ({ ...prev, department: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {departments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Período</label>
              <Select value={filters.date_range} onValueChange={(value) => setFilters(prev => ({ ...prev, date_range: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Últimos 7 días</SelectItem>
                  <SelectItem value="30">Últimos 30 días</SelectItem>
                  <SelectItem value="90">Últimos 90 días</SelectItem>
                  <SelectItem value="all">Todo el tiempo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Estadísticas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Onboardings</p>
                <p className="text-2xl font-bold">{stats?.total || 0}</p>
              </div>
              <Users className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Tasa de Finalización</p>
                <p className="text-2xl font-bold">{stats?.completion_rate.toFixed(1)}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-chart-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Tiempo Promedio</p>
                <p className="text-2xl font-bold">{formatDuration(stats?.avg_completion_time || 0)}</p>
              </div>
              <Clock className="h-8 w-8 text-chart-1" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Expiran Pronto</p>
                <p className="text-2xl font-bold text-chart-4">{stats?.expiring_soon || 0}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-chart-4" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Distribución por estado */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Distribución por Estado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-chart-4 rounded-full"></div>
                  <span className="text-sm">Pendientes</span>
                </div>
                <div className="text-right">
                  <span className="font-medium">{stats?.pending || 0}</span>
                  <span className="text-xs text-muted-foreground ml-1">
                    ({stats?.total ? ((stats.pending / stats.total) * 100).toFixed(1) : 0}%)
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-chart-1 rounded-full"></div>
                  <span className="text-sm">En Progreso</span>
                </div>
                <div className="text-right">
                  <span className="font-medium">{stats?.in_progress || 0}</span>
                  <span className="text-xs text-muted-foreground ml-1">
                    ({stats?.total ? ((stats.in_progress / stats.total) * 100).toFixed(1) : 0}%)
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-chart-2 rounded-full"></div>
                  <span className="text-sm">Completados</span>
                </div>
                <div className="text-right">
                  <span className="font-medium">{stats?.completed || 0}</span>
                  <span className="text-xs text-muted-foreground ml-1">
                    ({stats?.total ? ((stats.completed / stats.total) * 100).toFixed(1) : 0}%)
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-destructive rounded-full"></div>
                  <span className="text-sm">Expirados</span>
                </div>
                <div className="text-right">
                  <span className="font-medium">{stats?.expired || 0}</span>
                  <span className="text-xs text-muted-foreground ml-1">
                    ({stats?.total ? ((stats.expired / stats.total) * 100).toFixed(1) : 0}%)
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Alertas - Próximos a expirar */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-chart-4" />
              Expiran en 3 días
            </CardTitle>
          </CardHeader>
          <CardContent>
            {expiring.length === 0 ? (
              <div className="text-center py-6">
                <CheckCircle className="h-8 w-8 mx-auto mb-2 text-chart-2" />
                <p className="text-sm text-muted-foreground">
                  No hay onboardings próximos a expirar
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {expiring.map((onboarding) => (
                  <div key={onboarding.id} className="flex items-center justify-between p-3 bg-chart-4/5 rounded-lg">
                    <div>
                      <p className="font-medium text-sm">{onboarding.email}</p>
                      <p className="text-xs text-muted-foreground">{onboarding.position_title}</p>
                      {onboarding.department && (
                        <p className="text-xs text-muted-foreground">{onboarding.department.name}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className="text-xs">
                        <Calendar className="h-3 w-3 mr-1" />
                        {format(new Date(onboarding.expires_at), 'dd/MM', { locale: es })}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}