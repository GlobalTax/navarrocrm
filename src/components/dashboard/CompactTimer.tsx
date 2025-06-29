
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Play, Pause, Square, Clock, Timer } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useDashboardData } from '@/hooks/useDashboardData'

export const CompactTimer = () => {
  const navigate = useNavigate()
  const { data: dashboardData } = useDashboardData()
  
  // TODO: Integrar con el estado real del timer
  const hasActiveTimer = false
  const currentTime = '00:00'
  const currentTask = ''
  
  const todayHours = dashboardData?.quickStats.todayHours || 0

  if (!hasActiveTimer) {
    return (
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 hover-glow transition-all duration-200 w-full">
        <CardContent className="p-4">
          <div className="flex flex-col items-center justify-center text-center space-y-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Timer className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <p className="font-medium text-sm text-gray-900 mb-1">Timer</p>
              <p className="text-xs text-gray-600 mb-2">Hoy: {todayHours}h</p>
              <Button 
                size="sm" 
                onClick={() => navigate('/time-tracking')}
                className="bg-blue-600 hover:bg-blue-700 h-7 px-3 text-xs w-full"
              >
                <Play className="h-3 w-3 mr-1" />
                Iniciar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 hover-glow transition-all duration-200 w-full">
      <CardContent className="p-4">
        <div className="flex flex-col items-center justify-center text-center space-y-2">
          <div className="p-2 bg-green-100 rounded-lg">
            <Clock className="h-4 w-4 text-green-600 animate-pulse" />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-center gap-2">
              <p className="font-medium text-sm font-mono text-gray-900">{currentTime}</p>
              <Badge variant="outline" className="text-xs bg-green-50 border-green-200 h-5 px-2">
                Activo
              </Badge>
            </div>
            <p className="text-xs text-gray-600 truncate max-w-24">
              {currentTask || 'Trabajando...'}
            </p>
            <div className="flex gap-1 justify-center">
              <Button size="sm" variant="outline" className="h-6 w-6 p-0">
                <Pause className="h-3 w-3" />
              </Button>
              <Button size="sm" variant="outline" className="h-6 w-6 p-0">
                <Square className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
