
import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { CheckCircle } from 'lucide-react'
import { PROPOSAL_STEPS } from '../types/legalProposal.types'

interface LegalProposalProgressBarProps {
  currentStep: number
}

export const LegalProposalProgressBar: React.FC<LegalProposalProgressBarProps> = ({
  currentStep
}) => {
  const getStepProgress = () => {
    return ((currentStep - 1) / (PROPOSAL_STEPS.length - 1)) * 100
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">
              {PROPOSAL_STEPS[currentStep - 1].name}: {PROPOSAL_STEPS[currentStep - 1].description}
            </span>
            <span className="text-sm text-gray-500">
              {Math.round(getStepProgress())}% completado
            </span>
          </div>
          <Progress value={getStepProgress()} className="h-2" />
        </div>
        
        <div className="flex justify-between">
          {PROPOSAL_STEPS.map((step, index) => (
            <div
              key={step.id}
              className={`flex items-center ${
                index < PROPOSAL_STEPS.length - 1 ? 'flex-1' : ''
              }`}
            >
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                  step.id <= currentStep
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {step.id < currentStep ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  step.id
                )}
              </div>
              <span className={`ml-2 text-sm ${
                step.id <= currentStep ? 'text-gray-900' : 'text-gray-500'
              }`}>
                {step.name}
              </span>
              {index < PROPOSAL_STEPS.length - 1 && (
                <div className="flex-1 h-px bg-gray-200 mx-4" />
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
