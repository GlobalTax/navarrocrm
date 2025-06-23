
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Play, Pause, Square, Clock, Timer } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useDashboardData } from '@/hooks/useDashboardData'

export const EnhancedActiveTimer = () => {
  const navigate = useNavigate()
  const { data: dashboardData } = useDashboardData()
  
  // TODO: Integrar con el estado real del timer
  const hasActiveTimer = false
  const currentTime = '00:00'
  const currentTask = ''
  
  const todayHours = dashboardData?.quickStats.todayHours || 0
  const weekHours = dashboardData?.quickStats.weekHours || 0

  if (!hasActiveTimer) {
    return (
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Timer className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-sm">Timer de Trabajo</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>Hoy: {todayHours}h</span>
                  <span>•</span>
                  <span>Semana: {weekHours}h</span>
                </div>
              </div>
            </div>
            <Button 
              size="sm" 
              onClick={() => navigate('/time-tracking')}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Play className="h-4 w-4 mr-2" />
              Iniciar
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Clock className="h-4 w-4 text-green-600 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="font-medium text-sm font-mono">{currentTime}</p>
                <Badge variant="outline" className="text-xs bg-green-50 border-green-200">
                  En curso
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground truncate max-w-32">
                {currentTask || 'Trabajando...'}
              </p>
            </div>
          </div>
          <div className="flex gap-1">
            <Button size="sm" variant="outline" className="h-8 w-8 p-0">
              <Pause className="h-3 w-3" />
            </Button>
            <Button size="sm" variant="outline" className="h-8 w-8 p-0">
              <Square className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
