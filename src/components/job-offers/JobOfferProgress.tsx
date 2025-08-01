import React from 'react'
import { JobOfferStep } from '@/types/job-offers'
import { cn } from '@/lib/utils'
import { CheckCircle, Circle } from 'lucide-react'

interface JobOfferProgressProps {
  steps: JobOfferStep[]
  currentStep: number
  onStepClick: (stepIndex: number) => void
}

export function JobOfferProgress({ steps, currentStep, onStepClick }: JobOfferProgressProps) {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <button
              onClick={() => onStepClick(index)}
              className={cn(
                "flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors",
                index <= currentStep
                  ? "bg-primary border-primary text-primary-foreground"
                  : "bg-background border-muted-foreground text-muted-foreground hover:border-primary"
              )}
            >
              {index < currentStep ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                <span className="text-sm font-medium">{index + 1}</span>
              )}
            </button>
            
            {index < steps.length - 1 && (
              <div
                className={cn(
                  "flex-1 h-0.5 mx-2",
                  index < currentStep ? "bg-primary" : "bg-muted"
                )}
              />
            )}
          </div>
        ))}
      </div>
      
      <div className="mt-4 text-center">
        <h3 className="text-lg font-semibold">{steps[currentStep].title}</h3>
        <p className="text-sm text-muted-foreground">{steps[currentStep].description}</p>
      </div>
    </div>
  )
}