import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Play, Pause, Square, Clock } from 'lucide-react'
import { useTimeEntries } from '@/features/time-tracking'
import { toast } from 'sonner'

interface ClientTimerProps {
  clientId: string
  clientName: string
}

export const ClientTimer = ({ clientId, clientName }: ClientTimerProps) => {
  const [isRunning, setIsRunning] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [seconds, setSeconds] = useState(0)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const startTimeRef = useRef<Date | null>(null)

  const { createTimeEntry, isCreating } = useTimeEntries()

  useEffect(() => {
    if (isRunning && !isPaused) {
      intervalRef.current = setInterval(() => {
        setSeconds(prev => prev + 1)
      }, 1000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isRunning, isPaused])

  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const secs = totalSeconds % 60
    
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleStart = () => {
    setIsRunning(true)
    setIsPaused(false)
    startTimeRef.current = new Date()
    toast.success(`Timer iniciado para ${clientName}`)
  }

  const handlePause = () => {
    setIsPaused(true)
  }

  const handleResume = () => {
    setIsPaused(false)
  }

  const handleStop = async () => {
    if (seconds === 0) {
      toast.error('No hay tiempo registrado para guardar')
      return
    }

    const description = `Trabajo para ${clientName}`
    
    try {
      const minutes = Math.round(seconds / 60)
      
      await createTimeEntry({
        description,
        duration_minutes: minutes,
        is_billable: true,
        entry_type: 'billable'
      })

      // Reset timer
      setIsRunning(false)
      setIsPaused(false)
      setSeconds(0)
      startTimeRef.current = null

      toast.success(`${minutes} minutos registrados para ${clientName}`)
    } catch (error) {
      console.error('Error al registrar tiempo:', error)
      toast.error('Error al registrar el tiempo')
    }
  }

  const getStatusColor = () => {
    if (!isRunning) return 'text-muted-foreground'
    if (isPaused) return 'text-yellow-600'
    return 'text-green-600'
  }

  return (
    <Card className="border-0 shadow-none bg-muted/30">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Timer</span>
          </div>
          
          <div className="font-mono text-sm font-semibold">
            {formatTime(seconds)}
          </div>

          <div className="flex gap-1">
            {!isRunning ? (
              <Button
                size="sm"
                variant="outline"
                onClick={handleStart}
                disabled={isCreating}
                className="h-7 px-2"
              >
                <Play className="h-3 w-3" />
              </Button>
            ) : (
              <>
                {!isPaused ? (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handlePause}
                    className="h-7 px-2"
                  >
                    <Pause className="h-3 w-3" />
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleResume}
                    className="h-7 px-2"
                  >
                    <Play className="h-3 w-3" />
                  </Button>
                )}
                
                <Button
                  size="sm"
                  onClick={handleStop}
                  disabled={isCreating}
                  className="h-7 px-2 bg-primary hover:bg-primary/90"
                >
                  <Square className="h-3 w-3" />
                </Button>
              </>
            )}
          </div>

          {isRunning && (
            <span className={`text-xs ${getStatusColor()}`}>
              {isPaused ? 'Pausado' : 'Activo'}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  )
}