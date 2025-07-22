
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Activity, 
  DollarSign, 
  Zap, 
  Clock, 
  TrendingUp,
  Server
} from 'lucide-react'
import { AIUsageStats } from '@/hooks/useAIUsage'

interface AIUsageStatsProps {
  stats: AIUsageStats
  isLoading?: boolean
}

export const AIUsageStatsCards = ({ stats, isLoading }: AIUsageStatsProps) => {
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 bg-gray-200 rounded w-20"></div>
              <div className="h-4 w-4 bg-gray-200 rounded"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded w-16 mb-1"></div>
              <div className="h-3 bg-gray-200 rounded w-24"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Llamadas</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalCalls.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">
            Este mes
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Costo Estimado</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            ${stats.totalCost.toFixed(4)}
          </div>
          <p className="text-xs text-muted-foreground">
            USD este mes
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Tokens Usados</CardTitle>
          <Zap className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {(stats.totalTokens / 1000).toFixed(1)}K
          </div>
          <p className="text-xs text-muted-foreground">
            Tokens consumidos
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Tasa de Éxito</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {stats.successRate.toFixed(1)}%
          </div>
          <p className="text-xs text-muted-foreground">
            Llamadas exitosas
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

export const AIUsageByOrgCard = ({ stats }: AIUsageStatsProps) => {
  const orgEntries = Object.entries(stats.callsByOrg)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Server className="h-5 w-5" />
          Uso por Organización
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {orgEntries.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No hay datos disponibles
            </p>
          ) : (
            orgEntries.map(([orgName, calls]) => {
              const tokens = stats.tokensByOrg[orgName] || 0
              const cost = stats.costByOrg[orgName] || 0
              
              return (
                <div key={orgName} className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium truncate">{orgName}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="text-xs">
                        {calls} llamadas
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {(tokens / 1000).toFixed(1)}K tokens
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        ${cost.toFixed(4)}
                      </Badge>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </CardContent>
    </Card>
  )
}
