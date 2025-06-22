
import { useState, useEffect } from 'react'
import { Clock } from 'lucide-react'

export const HeaderClock = () => {
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    })
  }

  return (
    <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-gray-50">
      <Clock className="h-4 w-4 text-gray-500" />
      <span className="text-sm font-mono font-medium text-gray-700">
        {formatTime(currentTime)}
      </span>
    </div>
  )
}
