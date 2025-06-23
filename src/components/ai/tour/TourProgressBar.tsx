
import React from 'react'
import { Progress } from '@/components/ui/progress'

interface TourProgressBarProps {
  progress: number
}

export const TourProgressBar = React.memo<TourProgressBarProps>(({ progress }) => {
  return (
    <div className="space-y-2">
      <Progress value={progress} className="h-2" />
      <div className="flex justify-between text-xs text-blue-600">
        <span>Progreso</span>
        <span>{Math.round(progress)}%</span>
      </div>
    </div>
  )
})

TourProgressBar.displayName = 'TourProgressBar'
