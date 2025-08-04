import { Alert, AlertDescription } from '@/components/ui/alert'
import { Lightbulb } from 'lucide-react'
import { MatterBillingForm } from '../forms/MatterBillingForm'
import { useUsers } from '@/hooks/useUsers'
import { WizardFormData } from './types'

interface WizardStep2Props {
  formData: WizardFormData
  updateFormData: (updates: Partial<WizardFormData>) => void
  errors: Record<string, string>
}

export function WizardStep2({
  formData,
  updateFormData,
  errors
}: WizardStep2Props) {
  const { users } = useUsers()

  return (
    <div className="space-y-6">
      <MatterBillingForm
        billingMethod={formData.billing_method}
        estimatedBudget={formData.estimated_budget}
        onBillingMethodChange={(value) => updateFormData({ billing_method: value as any })}
        onEstimatedBudgetChange={(value) => updateFormData({ estimated_budget: value })}
      />

      {errors.billing_method && (
        <p className="text-sm text-red-600">{errors.billing_method}</p>
      )}

      {formData.practice_area && (
        <Alert>
          <Lightbulb className="h-4 w-4" />
          <AlertDescription>
            Para {formData.practice_area}, recomendamos usar facturación por horas o precio fijo.
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}