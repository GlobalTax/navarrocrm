
import { useState, useRef } from 'react'
import { useInterval } from '@/hooks/performance/useInterval'
import { Clock, Play, Pause, Square } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { HeaderTimerDialog } from './HeaderTimerDialog'
import { logger } from '@/utils/logging'

export const HeaderClock = () => {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [isTimerRunning, setIsTimerRunning] = useState(false)
  const [isTimerPaused, setIsTimerPaused] = useState(false)
  const [timerSeconds, setTimerSeconds] = useState(0)
  const [showTimerDialog, setShowTimerDialog] = useState(false)
  // Clock update with memory-safe interval
  useInterval(() => {
    setCurrentTime(new Date())
  }, 1000)

  // Timer with memory-safe interval
  useInterval(() => {
    setTimerSeconds(prev => prev + 1)
  }, isTimerRunning && !isTimerPaused ? 1000 : null)

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    })
  }

  const formatTimerTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const secs = totalSeconds % 60
    
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleTimerStart = () => {
    setIsTimerRunning(true)
    setIsTimerPaused(false)
    logger.debug('Timer iniciado desde header', { component: 'HeaderClock' })
  }

  const handleTimerPause = () => {
    setIsTimerPaused(true)
    logger.debug('Timer pausado desde header', { component: 'HeaderClock' })
  }

  const handleTimerResume = () => {
    setIsTimerPaused(false)
    logger.debug('Timer reanudado desde header', { component: 'HeaderClock' })
  }

  const handleTimerStop = () => {
    if (timerSeconds > 0) {
      // Abrir diálogo para registrar el tiempo
      setShowTimerDialog(true)
    } else {
      // Si no hay tiempo registrado, simplemente resetear
      handleTimerReset()
    }
  }

  const handleTimerReset = () => {
    setIsTimerRunning(false)
    setIsTimerPaused(false)
    setTimerSeconds(0)
    logger.debug('Timer reiniciado desde header', { component: 'HeaderClock' })
  }

  const handleTimerSaved = () => {
    // Resetear el timer después de guardar
    handleTimerReset()
    setShowTimerDialog(false)
  }

  const handleDialogClose = () => {
    setShowTimerDialog(false)
    // No resetear el timer, mantener el tiempo para que el usuario pueda intentar guardar de nuevo
  }

  return (
    <>
      <div className="flex items-center gap-2">
        {/* Reloj actual */}
        <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-gray-50">
          <Clock className="h-4 w-4 text-gray-500" />
          <span className="text-sm font-mono font-medium text-gray-700">
            {formatTime(currentTime)}
          </span>
        </div>

        {/* Separador */}
        <div className="h-6 w-px bg-gray-300" />

        {/* Timer y controles */}
        <div className="flex items-center gap-2">
          {/* Display del timer */}
          <div className="px-2 py-1 rounded bg-blue-50 border border-blue-200">
            <span className="text-sm font-mono font-medium text-blue-700">
              {formatTimerTime(timerSeconds)}
            </span>
          </div>

          {/* Controles del timer */}
          <div className="flex gap-1">
            {!isTimerRunning ? (
              <Button
                size="sm"
                variant="outline"
                onClick={handleTimerStart}
                className="h-8 w-8 p-0"
                title="Iniciar timer"
              >
                <Play className="h-3 w-3" />
              </Button>
            ) : (
              <>
                {!isTimerPaused ? (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleTimerPause}
                    className="h-8 w-8 p-0"
                    title="Pausar timer"
                  >
                    <Pause className="h-3 w-3" />
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleTimerResume}
                    className="h-8 w-8 p-0"
                    title="Reanudar timer"
                  >
                    <Play className="h-3 w-3" />
                  </Button>
                )}
                
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleTimerStop}
                  className="h-8 w-8 p-0"
                  title="Detener timer"
                >
                  <Square className="h-3 w-3" />
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Diálogo para registrar tiempo */}
      <HeaderTimerDialog
        isOpen={showTimerDialog}
        onClose={handleDialogClose}
        onSave={handleTimerSaved}
        timerSeconds={timerSeconds}
      />
    </>
  )
}
