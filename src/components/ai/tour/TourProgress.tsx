
import React from 'react'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { BookOpen, X } from 'lucide-react'

interface TourProgressProps {
  currentStep: number
  totalSteps: number
  progress: number
  onClose: () => void
}

export const TourProgress = React.memo<TourProgressProps>(({ 
  currentStep, 
  totalSteps, 
  progress, 
  onClose 
}) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-blue-100 rounded-lg">
          <BookOpen className="h-6 w-6 text-blue-600" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-blue-900">Tour de Herramientas IA</h2>
          <p className="text-sm text-blue-700">Descubre el poder de la inteligencia artificial</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Badge variant="secondary">
          {currentStep + 1} de {totalSteps}
        </Badge>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
})

TourProgress.displayName = 'TourProgress'
