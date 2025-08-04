export interface WizardFormData {
  title: string
  description?: string
  status: 'open' | 'on_hold' | 'closed'
  contact_id: string
  practice_area?: string
  responsible_solicitor_id?: string
  originating_solicitor_id?: string
  billing_method: 'hourly' | 'fixed' | 'contingency' | 'retainer'
  estimated_budget?: number
  template_selection: string
}

export interface WizardStep {
  id: number
  title: string
  description: string
}

export interface MatterWizardProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: any) => void
  isLoading?: boolean
  isSuccess?: boolean
  onResetCreate?: () => void
}