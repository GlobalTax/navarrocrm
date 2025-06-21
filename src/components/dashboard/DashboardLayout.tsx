
import { TodayAgenda } from './TodayAgenda'
import { PerformanceChart } from './PerformanceChart'
import { RecentActivity } from './RecentActivity'

export const DashboardLayout = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Columna izquierda - Agenda */}
      <div className="lg:col-span-4 space-y-6">
        <TodayAgenda />
      </div>
      
      {/* Columna central - Gráficos */}
      <div className="lg:col-span-5 space-y-6">
        <PerformanceChart />
      </div>
      
      {/* Columna derecha - Actividad reciente */}
      <div className="lg:col-span-3">
        <RecentActivity />
      </div>
    </div>
  )
}
