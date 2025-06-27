
import { AdvancedTemplateData } from '@/types/templateTypes'
import { BillingMethodSelector } from './billing/BillingMethodSelector'
import { BillingRatesManager } from './billing/BillingRatesManager'
import { HoursEstimationForm } from './billing/HoursEstimationForm'
import { ExpensesManager } from './billing/ExpensesManager'
import { FinancialSummaryCard } from './billing/FinancialSummaryCard'

interface TemplateWizardStep2Props {
  formData: {
    template_data: AdvancedTemplateData
  }
  updateTemplateData: (updates: Partial<AdvancedTemplateData>) => void
  errors: Record<string, string>
}

export function TemplateWizardStep2({ formData, updateTemplateData, errors }: TemplateWizardStep2Props) {
  const billing = formData.template_data.billing

  const updateBilling = (updates: Partial<typeof billing>) => {
    updateTemplateData({
      billing: { ...billing, ...updates }
    })
  }

  return (
    <div className="space-y-6">
      <BillingMethodSelector 
        billing={billing} 
        onBillingUpdate={updateBilling} 
      />
      
      <BillingRatesManager 
        billing={billing} 
        onBillingUpdate={updateBilling} 
      />
      
      <HoursEstimationForm 
        billing={billing} 
        onBillingUpdate={updateBilling} 
        errors={errors}
      />
      
      <ExpensesManager 
        billing={billing} 
        onBillingUpdate={updateBilling} 
      />
      
      <FinancialSummaryCard billing={billing} />
    </div>
  )
}
