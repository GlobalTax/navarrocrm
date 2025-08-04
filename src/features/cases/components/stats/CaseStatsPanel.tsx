import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Clock, Calendar, DollarSign, Target } from 'lucide-react'

interface CaseStatsPanelProps {
  caseId: string
}

// Mock stats - replace with actual hook when available
const mockStats = {
  totalHours: 45.5,
  estimatedHours: 60,
  billedAmount: 4550,
  estimatedBudget: 6000,
  tasksCompleted: 8,
  totalTasks: 12,
  daysRemaining: 14,
  progress: 65
}

export const CaseStatsPanel = ({ caseId }: CaseStatsPanelProps) => {
  const stats = mockStats // Replace with useCaseStats(caseId) when available

  const progressPercentage = (stats.totalHours / stats.estimatedHours) * 100
  const budgetUsed = (stats.billedAmount / stats.estimatedBudget) * 100
  const tasksProgress = (stats.tasksCompleted / stats.totalTasks) * 100

  return (
    <div className="space-y-6">
      {/* Progress Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Progreso de Horas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Registradas: {stats.totalHours}h</span>
                <span>Estimadas: {stats.estimatedHours}h</span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
              <p className="text-xs text-muted-foreground">
                {progressPercentage.toFixed(1)}% del tiempo estimado utilizado
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Presupuesto
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Facturado: €{stats.billedAmount}</span>
                <span>Presupuesto: €{stats.estimatedBudget}</span>
              </div>
              <Progress value={budgetUsed} className="h-2" />
              <p className="text-xs text-muted-foreground">
                {budgetUsed.toFixed(1)}% del presupuesto utilizado
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-blue-500" />
              <div>
                <div className="text-2xl font-bold">{stats.tasksCompleted}/{stats.totalTasks}</div>
                <div className="text-xs text-muted-foreground">Tareas</div>
              </div>
            </div>
            <Progress value={tasksProgress} className="h-1 mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-green-500" />
              <div>
                <div className="text-2xl font-bold">{stats.daysRemaining}</div>
                <div className="text-xs text-muted-foreground">Días restantes</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-orange-500" />
              <div>
                <div className="text-2xl font-bold">{stats.totalHours}</div>
                <div className="text-xs text-muted-foreground">Horas total</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-purple-500" />
              <div>
                <div className="text-2xl font-bold">€{stats.billedAmount}</div>
                <div className="text-xs text-muted-foreground">Facturado</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status Badge */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Estado general:</span>
          <Badge variant={stats.progress > 75 ? 'default' : stats.progress > 50 ? 'secondary' : 'outline'}>
            {stats.progress > 75 ? 'En buen ritmo' : stats.progress > 50 ? 'En progreso' : 'Requiere atención'}
          </Badge>
        </div>
        <span className="text-sm text-muted-foreground">{stats.progress}% completado</span>
      </div>
    </div>
  )
}