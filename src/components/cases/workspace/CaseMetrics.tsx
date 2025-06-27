
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, TrendingDown, Clock, Target, AlertTriangle } from 'lucide-react'
import { Case } from '@/hooks/useCases'

interface CaseMetricsProps {
  case_: Case
}

export function CaseMetrics({ case_ }: CaseMetricsProps) {
  // Mock data - en producción vendría de hooks reales
  const metrics = {
    overallProgress: 65,
    tasksCompleted: 8,
    totalTasks: 12,
    hoursSpent: 18.5,
    estimatedHours: 22,
    budgetUsed: 3250,
    totalBudget: 5000,
    efficiency: 94, // porcentaje de eficiencia
    clientSatisfaction: 4.8,
    daysActive: 12,
    averageCaseDuration: 21,
    riskScore: 23 // 0-100, menor es mejor
  }

  const efficiencyTrend = 5.2 // porcentaje de mejora
  const budgetVariance = ((metrics.budgetUsed / metrics.totalBudget) - (metrics.hoursSpent / metrics.estimatedHours)) * 100

  const getRiskColor = (score: number) => {
    if (score < 30) return 'text-green-600'
    if (score < 70) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getRiskLevel = (score: number) => {
    if (score < 30) return 'Bajo'
    if (score < 70) return 'Medio'
    return 'Alto'
  }

  return (
    <div className="space-y-4">
      {/* Progreso general */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Progreso General</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-1">
              {metrics.overallProgress}%
            </div>
            <Progress value={metrics.overallProgress} className="h-2" />
          </div>
          
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="text-center">
              <div className="font-semibold">{metrics.tasksCompleted}/{metrics.totalTasks}</div>
              <div className="text-gray-500">Tareas</div>
            </div>
            <div className="text-center">
              <div className="font-semibold">{metrics.hoursSpent}h/{metrics.estimatedHours}h</div>
              <div className="text-gray-500">Tiempo</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Eficiencia */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            Eficiencia
            <div className="flex items-center gap-1 text-green-600">
              <TrendingUp className="h-4 w-4" />
              <span className="text-sm">+{efficiencyTrend}%</span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {metrics.efficiency}%
            </div>
            <div className="text-sm text-gray-500">vs promedio del despacho</div>
          </div>
        </CardContent>
      </Card>

      {/* Presupuesto */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Estado Presupuesto</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm">Usado</span>
            <span className="font-semibold">€{metrics.budgetUsed.toLocaleString()}</span>
          </div>
          <Progress 
            value={(metrics.budgetUsed / metrics.totalBudget) * 100} 
            className="h-2"
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>€0</span>
            <span>€{metrics.totalBudget.toLocaleString()}</span>
          </div>
          
          {budgetVariance !== 0 && (
            <div className={`flex items-center gap-1 text-xs ${budgetVariance > 0 ? 'text-red-600' : 'text-green-600'}`}>
              {budgetVariance > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              <span>
                {budgetVariance > 0 ? 'Sobre' : 'Bajo'} presupuesto {Math.abs(budgetVariance).toFixed(1)}%
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Duración */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Duración
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm">Días activos</span>
              <span className="font-semibold">{metrics.daysActive}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Promedio despacho</span>
              <span className="text-gray-500">{metrics.averageCaseDuration} días</span>
            </div>
            <div className="mt-2">
              <Badge 
                className={metrics.daysActive < metrics.averageCaseDuration ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}
              >
                {metrics.daysActive < metrics.averageCaseDuration ? 'Adelantado' : 'En tiempo'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Riesgo */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Análisis de Riesgo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="text-center">
              <div className={`text-2xl font-bold ${getRiskColor(metrics.riskScore)}`}>
                {getRiskLevel(metrics.riskScore)}
              </div>
              <div className="text-sm text-gray-500">{metrics.riskScore}/100</div>
            </div>
            
            <Progress 
              value={metrics.riskScore} 
              className="h-2"
            />
            
            <div className="text-xs text-gray-600 space-y-1">
              <div>• Cumplimiento de plazos: ✓</div>
              <div>• Presupuesto controlado: ✓</div>
              <div>• Comunicación cliente: ✓</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Satisfacción cliente */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Satisfacción Cliente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {metrics.clientSatisfaction}/5
            </div>
            <div className="flex justify-center">
              {'★'.repeat(Math.floor(metrics.clientSatisfaction))}
              {'☆'.repeat(5 - Math.floor(metrics.clientSatisfaction))}
            </div>
            <div className="text-sm text-gray-500 mt-1">
              Basado en comunicaciones
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
