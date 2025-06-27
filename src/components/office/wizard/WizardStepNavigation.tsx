
import { ArrowRight, CheckCircle } from 'lucide-react'

interface WizardStep {
  title: string
  icon: React.ComponentType<{ className?: string }>
}

interface WizardStepNavigationProps {
  steps: WizardStep[]
  currentStep: number
}

export const WizardStepNavigation = ({ steps, currentStep }: WizardStepNavigationProps) => {
  return (
    <div className="flex justify-center mb-8">
      <div className="flex items-center space-x-4">
        {steps.map((step, index) => (
          <div key={index} className="flex items-center">
            <div className={`
              flex items-center justify-center w-10 h-10 rounded-full border-2 
              ${index <= currentStep 
                ? 'bg-blue-600 border-blue-600 text-white' 
                : 'border-gray-300 text-gray-400'
              }
            `}>
              {index < currentStep ? (
                <CheckCircle className="h-5 w-5" />
              ) : (
                <step.icon className="h-5 w-5" />
              )}
            </div>
            {index < steps.length - 1 && (
              <ArrowRight className="h-4 w-4 text-gray-400 mx-2" />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
