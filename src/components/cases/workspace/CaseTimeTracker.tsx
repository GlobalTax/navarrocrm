
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Play, Pause, Square, Clock, Euro } from 'lucide-react'
import { Case } from '@/hooks/useCases'

interface CaseTimeTrackerProps {
  case_: Case
}

interface TimeEntry {
  id: string
  description: string
  duration: number
  date: string
  task?: string
  phase?: string
  billable: boolean
  rate: number
}

export function CaseTimeTracker({ case_ }: CaseTimeTrackerProps) {
  const [isRunning, setIsRunning] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [currentDescription, setCurrentDescription] = useState('')

  const [timeEntries] = useState<TimeEntry[]>([
    {
      id: '1',
      description: 'Revisión de documentación inicial',
      duration: 90, // minutos
      date: '2024-01-15',
      task: 'Revisar documentación inicial',
      phase: 'Investigación',
      billable: true,
      rate: 150
    },
    {
      id: '2',
      description: 'Preparación de documentos probatorios',
      duration: 150,
      date: '2024-01-16',
      task: 'Preparar documentación probatoria',
      phase: 'Documentación',
      billable: true,
      rate: 150
    },
    {
      id: '3',
      description: 'Reunión interna de estrategia',
      duration: 60,
      date: '2024-01-17',
      billable: false,
      rate: 0
    }
  ])

  const totalHours = timeEntries.reduce((sum, entry) => sum + entry.duration, 0) / 60
  const billableHours = timeEntries
    .filter(entry => entry.billable)
    .reduce((sum, entry) => sum + entry.duration, 0) / 60
  const totalValue = timeEntries
    .filter(entry => entry.billable)
    .reduce((sum, entry) => sum + (entry.duration / 60) * entry.rate, 0)

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}:${mins.toString().padStart(2, '0')}`
  }

  const handleStartStop = () => {
    setIsRunning(!isRunning)
  }

  const handleStop = () => {
    setIsRunning(false)
    setCurrentTime(0)
    setCurrentDescription('')
  }

  return (
    <div className="space-y-6">
      {/* Timer Activo */}
      <Card className="border-2 border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Timer Activo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-4xl font-mono font-bold text-blue-600">
                {formatTime(currentTime)}
              </div>
            </div>
            
            <input
              type="text"
              placeholder="Descripción de la actividad..."
              value={currentDescription}
              onChange={(e) => setCurrentDescription(e.target.value)}
              className="w-full p-2 border rounded-md"
            />
            
            <div className="flex justify-center gap-3">
              <Button
                onClick={handleStartStop}
                variant={isRunning ? "destructive" : "default"}
                size="lg"
              >
                {isRunning ? (
                  <>
                    <Pause className="h-4 w-4 mr-2" />
                    Pausar
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Iniciar
                  </>
                )}
              </Button>
              
              <Button onClick={handleStop} variant="outline" size="lg">
                <Square className="h-4 w-4 mr-2" />
                Detener
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resumen de Tiempo */}
      <div className="grid grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-blue-600">
              {totalHours.toFixed(1)}h
            </div>
            <div className="text-sm text-gray-600">Tiempo Total</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-green-600">
              {billableHours.toFixed(1)}h
            </div>
            <div className="text-sm text-gray-600">Horas Facturables</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-purple-600">
              €{totalValue.toFixed(0)}
            </div>
            <div className="text-sm text-gray-600">Valor Facturado</div>
          </CardContent>
        </Card>
      </div>

      {/* Historial de Tiempo */}
      <Card>
        <CardHeader>
          <CardTitle>Registro de Tiempo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {timeEntries.map((entry) => (
              <div key={entry.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium">{entry.description}</h4>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>{new Date(entry.date).toLocaleDateString()}</span>
                    {entry.task && <span>• {entry.task}</span>}
                    {entry.phase && (
                      <Badge variant="outline" className="text-xs">
                        {entry.phase}
                      </Badge>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="font-medium">
                      {formatTime(entry.duration)}
                    </div>
                    {entry.billable && (
                      <div className="text-sm text-green-600">
                        €{((entry.duration / 60) * entry.rate).toFixed(0)}
                      </div>
                    )}
                  </div>
                  
                  <Badge className={entry.billable ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}>
                    {entry.billable ? 'Facturable' : 'No Facturable'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
