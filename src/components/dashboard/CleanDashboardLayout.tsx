
import { CleanDashboardMetrics } from './CleanDashboardMetrics'
import { EnhancedActiveTimer } from './EnhancedActiveTimer'
import { TodayAgenda } from './TodayAgenda'
import { EnhancedPerformanceChart } from './EnhancedPerformanceChart'
import { EnhancedRecentActivity } from './EnhancedRecentActivity'

export const CleanDashboardLayout = () => {
  return (
    <div className="space-y-8">
      {/* Timer activo - solo una vez */}
      <EnhancedActiveTimer />
      
      {/* Métricas principales en grid limpio */}
      <CleanDashboardMetrics />
      
      {/* Contenido principal organizado */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* Columna izquierda - Agenda */}
        <div className="xl:col-span-4 space-y-6">
          <TodayAgenda />
        </div>
        
        {/* Columna central - Gráfico de rendimiento */}
        <div className="xl:col-span-5 space-y-6">
          <EnhancedPerformanceChart />
        </div>
        
        {/* Columna derecha - Actividad reciente */}
        <div className="xl:col-span-3 space-y-6">
          <EnhancedRecentActivity />
        </div>
      </div>
    </div>
  )
}
