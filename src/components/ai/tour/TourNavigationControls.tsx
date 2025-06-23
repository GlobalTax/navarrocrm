
import React from 'react'
import { Button } from '@/components/ui/button'
import { ArrowLeft, ArrowRight } from 'lucide-react'

interface TourNavigationControlsProps {
  currentStep: number
  totalSteps: number
  onPrevious: () => void
  onNext: () => void
  onClose: () => void
}

export const TourNavigationControls = React.memo<TourNavigationControlsProps>(({ 
  currentStep, 
  totalSteps, 
  onPrevious, 
  onNext, 
  onClose 
}) => {
  return (
    <div className="flex items-center justify-between pt-4 border-t">
      <div className="flex gap-2">
        {currentStep > 0 && (
          <Button variant="outline" onClick={onPrevious}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            Anterior
          </Button>
        )}
        <Button variant="ghost" onClick={onClose}>
          Saltar tour
        </Button>
      </div>
      
      <Button onClick={onNext}>
        {currentStep < totalSteps - 1 ? (
          <>
            Siguiente
            <ArrowRight className="h-4 w-4 ml-1" />
          </>
        ) : (
          'Comenzar'
        )}
      </Button>
    </div>
  )
})

TourNavigationControls.displayName = 'TourNavigationControls'
