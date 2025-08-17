import { useState, useEffect, useRef } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Play, Pause, Square, Clock, Coffee, Target } from 'lucide-react'
import { useTimeEntries } from '@/hooks/useTimeEntries'
import { toast } from 'sonner'

interface TimerModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  caseId: string
  caseTitle: string
}

export const TimerModal = ({ open, onOpenChange, caseId, caseTitle }: TimerModalProps) => {
  const [isRunning, setIsRunning] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [seconds, setSeconds] = useState(0)
  const [description, setDescription] = useState('')
  const [isBillable, setIsBillable] = useState(true)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

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

    if (!description.trim()) {
      toast.error('Añade una descripción antes de guardar el tiempo')
      return
    }

    try {
      const minutes = Math.round(seconds / 60)
      
      await createTimeEntry({
        case_id: caseId,
        description: description.trim(),
        duration_minutes: minutes,
        is_billable: isBillable,
        entry_type: 'billable'
      })

      // Reset timer
      setIsRunning(false)
      setIsPaused(false)
      setSeconds(0)
      setDescription('')
      onOpenChange(false)

      toast.success(`Tiempo registrado: ${minutes} minutos`)
    } catch (error) {
      console.error('❌ Error al registrar tiempo:', error)
      toast.error('Error al registrar el tiempo')
    }
  }

  const handleReset = () => {
    setIsRunning(false)
    setIsPaused(false)
    setSeconds(0)
  }

  const addQuickTime = (minutes: number) => {
    setSeconds(prev => prev + (minutes * 60))
  }

  const getTimerColor = () => {
    if (!isRunning) return 'text-gray-400'
    if (isPaused) return 'text-yellow-500'
    return 'text-green-500'
  }

  const getTimerBg = () => {
    if (!isRunning) return 'bg-gray-50'
    if (isPaused) return 'bg-yellow-50'
    return 'bg-green-50'
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">Timer - {caseTitle}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Timer Display */}
          <div className="text-center">
            <div className={`mx-auto w-32 h-32 rounded-full border-8 flex items-center justify-center ${getTimerBg()} border-current ${getTimerColor()}`}>
              <div className="text-center">
                <div className={`text-xl font-mono font-bold ${getTimerColor()}`}>
                  {formatTime(seconds)}
                </div>
                <div className="text-xs text-gray-500">
                  {isRunning ? (isPaused ? 'PAUSADO' : 'ACTIVO') : 'DETENIDO'}
                </div>
              </div>
            </div>
          </div>

          {/* Controles principales */}
          <div className="flex justify-center gap-3">
            {!isRunning ? (
              <Button
                onClick={handleStart}
                size="lg"
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                disabled={isCreating}
              >
                <Play className="h-5 w-5" />
                Iniciar
              </Button>
            ) : (
              <>
                {!isPaused ? (
                  <Button
                    onClick={handlePause}
                    variant="outline"
                    size="lg"
                    className="flex items-center gap-2 border-yellow-300 text-yellow-600 hover:bg-yellow-50"
                  >
                    <Pause className="h-5 w-5" />
                    Pausar
                  </Button>
                ) : (
                  <Button
                    onClick={handleResume}
                    size="lg"
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                  >
                    <Play className="h-5 w-5" />
                    Continuar
                  </Button>
                )}
                
                <Button
                  onClick={handleStop}
                  size="lg"
                  className="flex items-center gap-2 bg-red-600 hover:bg-red-700"
                  disabled={isCreating}
                >
                  <Square className="h-5 w-5" />
                  Guardar
                </Button>
              </>
            )}
          </div>

          {/* Quick time buttons */}
          <div className="flex justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => addQuickTime(15)}
              className="flex items-center gap-1"
            >
              <Clock className="h-3 w-3" />
              +15m
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => addQuickTime(30)}
              className="flex items-center gap-1"
            >
              <Coffee className="h-3 w-3" />
              +30m
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => addQuickTime(60)}
              className="flex items-center gap-1"
            >
              <Target className="h-3 w-3" />
              +1h
            </Button>
            {(isRunning || seconds > 0) && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                disabled={isCreating}
              >
                Reset
              </Button>
            )}
          </div>

          {/* Descripción */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">
              ¿En qué trabajaste?
            </Label>
            <Textarea
              id="description"
              placeholder="Descripción del trabajo..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="resize-none h-20"
              rows={2}
            />
          </div>

          {/* Facturable */}
          <div className="flex items-center justify-between">
            <Label htmlFor="billable" className="text-sm font-medium">
              Tiempo facturable
            </Label>
            <Switch
              id="billable"
              checked={isBillable}
              onCheckedChange={setIsBillable}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}