
import { useApp } from '@/contexts/AppContext'
import { useDashboardData } from '@/hooks/useDashboardData'
import { getDashboardPermissions, getRoleDisplayName } from '@/utils/dashboardPermissions'
import { getMetricsForRole } from '@/utils/roleBasedMetrics'
import { MetricCardClean } from './MetricCardClean'
import { Badge } from '@/components/ui/badge'

export const RoleBasedDashboard = () => {
  const { user } = useApp()
  const { data: dashboardData, isLoading } = useDashboardData()
  
  const permissions = getDashboardPermissions(user?.role)
  const metrics = getMetricsForRole(user?.role, dashboardData)
  const roleDisplayName = getRoleDisplayName(user?.role)

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div 
            key={i} 
            className="h-32 bg-gray-100 rounded-[10px] border-0.5 border-black animate-pulse"
          />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header con rol del usuario */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Dashboard - {roleDisplayName}
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Vista personalizada según tu rol
          </p>
        </div>
        <Badge 
          variant="outline" 
          className="border-0.5 border-black rounded-[10px] font-manrope"
        >
          {roleDisplayName}
        </Badge>
      </div>

      {/* Métricas sin iconos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric) => (
          <MetricCardClean
            key={metric.key}
            title={metric.title}
            value={metric.getValue(dashboardData!)}
            subtitle={metric.subtitle}
            trend={metric.trend}
            className={metric.className}
          />
        ))}
      </div>

      {/* Mensaje informativo para roles limitados */}
      {(user?.role === 'junior' || user?.role === 'senior') && (
        <div className="bg-blue-50 border border-blue-200 rounded-[10px] p-4">
          <div className="flex items-start space-x-3">
            <div className="text-sm text-blue-800">
              <p className="font-medium">Información personalizada</p>
              <p className="mt-1">
                {user?.role === 'junior' 
                  ? 'Como Junior, ves tus métricas personales y tareas asignadas.'
                  : 'Como Senior, tienes acceso a métricas del equipo pero no financieras.'
                }
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
