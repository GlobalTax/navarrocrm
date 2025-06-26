
import { useState, useEffect, useRef, useCallback } from 'react'
import { Clock, Play, Pause, Square } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const HeaderClock = () => {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [isTimerRunning, setIsTimerRunning] = useState(false)
  const [isTimerPaused, setIsTimerPaused] = useState(false)
  const [timerSeconds, setTimerSeconds] = useState(0)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  // Efecto para manejar el timer
  useEffect(() => {
    if (isTimerRunning && !isTimerPaused) {
      intervalRef.current = setInterval(() => {
        setTimerSeconds(prev => prev + 1)
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
  }, [isTimerRunning, isTimerPaused])

  const formatTime = useCallback((date: Date) => {
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    })
  }, [])

  const formatTimerTime = useCallback((totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const secs = totalSeconds % 60
    
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }, [])

  const handleTimerStart = useCallback(() => {
    setIsTimerRunning(true)
    setIsTimerPaused(false)
    console.log('⏱️ Timer iniciado desde header')
  }, [])

  const handleTimerPause = useCallback(() => {
    setIsTimerPaused(true)
    console.log('⏱️ Timer pausado desde header')
  }, [])

  const handleTimerResume = useCallback(() => {
    setIsTimerPaused(false)
    console.log('⏱️ Timer reanudado desde header')
  }, [])

  const handleTimerStop = useCallback(() => {
    setIsTimerRunning(false)
    setIsTimerPaused(false)
    setTimerSeconds(0)
    console.log('⏱️ Timer detenido desde header')
  }, [])

  return (
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
  )
}
