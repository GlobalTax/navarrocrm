
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { CheckSquare, Clock, FileText, Euro, TrendingUp, Users } from 'lucide-react'
import { useCaseStats } from '@/hooks/useCaseStats'

interface CaseStatsPanelProps {
  caseId: string
}

const StatCard = ({ 
  icon: Icon, 
  title, 
  value, 
  subtitle, 
  color = "text-blue-600" 
}: {
  icon: any
  title: string
  value: string | number
  subtitle?: string
  color?: string
}) => (
  <div className="flex items-center gap-3 p-4 bg-white border rounded-lg shadow-sm">
    <div className={`p-2 rounded-lg bg-gray-50 ${color}`}>
      <Icon className="h-5 w-5" />
    </div>
    <div className="flex-1">
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      <div className="text-sm text-gray-600">{title}</div>
      {subtitle && (
        <div className="text-xs text-gray-500">{subtitle}</div>
      )}
    </div>
  </div>
)

export const CaseStatsPanel = ({ caseId }: CaseStatsPanelProps) => {
  const { stats, isLoading, error } = useCaseStats(caseId)

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Estadísticas del Expediente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-red-600">
            Error al cargar las estadísticas
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Estadísticas del Expediente
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-4 border rounded-lg">
                <Skeleton className="w-10 h-10 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-6 w-12" />
                  <Skeleton className="h-4 w-20" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <StatCard
              icon={CheckSquare}
              title="Tareas Totales"
              value={stats.totalTasks}
              subtitle={`${stats.completedTasks} completadas`}
              color="text-blue-600"
            />
            
            <StatCard
              icon={Clock}
              title="Tiempo Total"
              value={`${stats.totalTimeHours}h`}
              subtitle={`${stats.billableTimeHours}h facturables`}
              color="text-green-600"
            />
            
            <StatCard
              icon={FileText}
              title="Documentos"
              value={stats.totalDocuments}
              subtitle="Próximamente"
              color="text-purple-600"
            />
            
            <StatCard
              icon={Euro}
              title="Facturado"
              value={`€${stats.totalInvoiced}`}
              subtitle="Total facturado"
              color="text-emerald-600"
            />
            
            <StatCard
              icon={TrendingUp}
              title="Progreso"
              value={`${stats.totalTasks > 0 ? Math.round((stats.completedTasks / stats.totalTasks) * 100) : 0}%`}
              subtitle="Tareas completadas"
              color="text-orange-600"
            />
            
            <StatCard
              icon={Users}
              title="Equipo"
              value="--"
              subtitle="Próximamente"
              color="text-indigo-600"
            />
          </div>
        )}
      </CardContent>
    </Card>
  )
}
