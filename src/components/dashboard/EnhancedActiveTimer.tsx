
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Play, Pause, Square, Clock, Timer } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useDashboardMetrics } from '@/features/dashboard'
import { useState } from 'react'
import { useInterval } from '@/hooks/performance/useInterval'
import { toast } from 'sonner'

export const EnhancedActiveTimer = () => {
  const navigate = useNavigate()
  const { data: dashboardData } = useDashboardMetrics()
  const [elapsedTime, setElapsedTime] = useState(0)
  
  // Por ahora, mostrar estado estático hasta implementar funcionalidad completa
  const hasActiveTimer = false
  const currentTask = 'Trabajo general'
  
  const todayHours = dashboardData?.quickStats.todayHours || 0
  const weekHours = dashboardData?.quickStats.weekHours || 0

  // Timer real-time con cleanup automático
  useInterval(() => {
    if (hasActiveTimer) {
      setElapsedTime(prev => prev + 1)
    }
  }, hasActiveTimer ? 1000 : null)

  // Formatear tiempo elapsed a MM:SS
  const formatElapsedTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleStartTimer = () => {
    navigate('/time-tracking')
    toast.success('Redirigiendo a Time Tracking para iniciar timer')
  }

  const handlePauseTimer = () => {
    navigate('/time-tracking')
  }

  const handleStopTimer = () => {
    navigate('/time-tracking')
  }

  if (!hasActiveTimer) {
    return (
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardContent className="p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-blue-100 rounded-md">
                <Timer className="h-3 w-3 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-sm">Timer de Trabajo</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>Hoy: {todayHours.toFixed(1)}h</span>
                  <span>•</span>
                  <span>Semana: {weekHours.toFixed(1)}h</span>
                </div>
              </div>
            </div>
            <Button 
              size="sm" 
              onClick={handleStartTimer}
              className="bg-blue-600 hover:bg-blue-700 h-7 px-3 text-xs"
            >
              <Play className="h-3 w-3 mr-1" />
              Iniciar
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
      <CardContent className="p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-green-100 rounded-md">
              <Clock className="h-3 w-3 text-green-600 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="font-medium text-sm font-mono">{formatElapsedTime(elapsedTime)}</p>
                <Badge variant="outline" className="text-xs bg-green-50 border-green-200 h-5 px-2">
                  En curso
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground truncate max-w-32">
                {currentTask || 'Trabajando...'}
              </p>
            </div>
          </div>
          <div className="flex gap-1">
            <Button 
              size="sm" 
              variant="outline" 
              className="h-6 w-6 p-0"
              onClick={handlePauseTimer}
            >
              <Pause className="h-3 w-3" />
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              className="h-6 w-6 p-0"
              onClick={handleStopTimer}
            >
              <Square className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
