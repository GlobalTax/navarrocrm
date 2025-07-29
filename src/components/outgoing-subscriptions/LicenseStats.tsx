import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useSubscriptionAssignmentStats } from '@/hooks/useSubscriptionAssignments'
import { 
  Users, 
  CreditCard, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react'

export const LicenseStats = () => {
  const { data: stats, isLoading } = useSubscriptionAssignmentStats()

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="border-0.5 rounded-[10px] animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 w-16 bg-muted rounded" />
            </CardHeader>
            <CardContent>
              <div className="h-8 w-24 bg-muted rounded mb-2" />
              <div className="h-3 w-32 bg-muted rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!stats) return null

  const utilizationColor = stats.utilizationRate >= 90 
    ? 'bg-destructive' 
    : stats.utilizationRate >= 70 
    ? 'bg-warning' 
    : 'bg-success'

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Subscriptions */}
        <Card className="border-0.5 rounded-[10px]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Suscripciones</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSubscriptions}</div>
            <p className="text-xs text-muted-foreground">
              Suscripciones activas
            </p>
          </CardContent>
        </Card>

        {/* Total Licenses */}
        <Card className="border-0.5 rounded-[10px]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Licencias</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalLicenses}</div>
            <p className="text-xs text-muted-foreground">
              Licencias disponibles
            </p>
          </CardContent>
        </Card>

        {/* Assigned Licenses */}
        <Card className="border-0.5 rounded-[10px]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Licencias Asignadas</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.assignedLicenses}</div>
            <p className="text-xs text-muted-foreground">
              de {stats.totalLicenses} disponibles
            </p>
          </CardContent>
        </Card>

        {/* Users with Licenses */}
        <Card className="border-0.5 rounded-[10px]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuarios con Licencias</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.usersWithLicenses}</div>
            <p className="text-xs text-muted-foreground">
              usuarios activos
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Utilization Overview */}
      <Card className="border-0.5 rounded-[10px]">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Utilización de Licencias</CardTitle>
              <CardDescription>
                Estado general del uso de licencias en la organización
              </CardDescription>
            </div>
            <Badge 
              variant={stats.utilizationRate >= 90 ? 'destructive' : stats.utilizationRate >= 70 ? 'secondary' : 'default'}
              className="border-0.5 rounded-[10px]"
            >
              {Math.round(stats.utilizationRate)}% utilizado
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Licencias asignadas</span>
              <span>{stats.assignedLicenses} / {stats.totalLicenses}</span>
            </div>
            <Progress 
              value={stats.utilizationRate} 
              className="h-2"
            />
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            <div className="flex items-center gap-2 text-sm">
              <div className="h-3 w-3 rounded-full bg-success"></div>
              <span>Disponibles: {stats.availableLicenses}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="h-3 w-3 rounded-full bg-primary"></div>
              <span>En uso: {stats.assignedLicenses}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="h-3 w-3 rounded-full bg-muted"></div>
              <span>Total: {stats.totalLicenses}</span>
            </div>
          </div>

          {/* Recommendations */}
          {stats.availableLicenses === 0 && (
            <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-[10px]">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              <span className="text-sm text-destructive font-medium">
                Sin licencias disponibles. Considera adquirir más licencias o reasignar las existentes.
              </span>
            </div>
          )}

          {stats.utilizationRate < 50 && stats.totalLicenses > 0 && (
            <div className="flex items-center gap-2 p-3 bg-primary/10 border border-primary/20 rounded-[10px]">
              <Clock className="h-4 w-4 text-primary" />
              <span className="text-sm text-primary font-medium">
                Baja utilización detectada. Podrías optimizar costes reduciendo licencias no utilizadas.
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}