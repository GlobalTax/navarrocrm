
import { CreateCaseData } from '@/hooks/useCases'

export interface WizardFormData extends CreateCaseData {
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
  onSubmit: (data: CreateCaseData) => void
  isLoading?: boolean
  isSuccess?: boolean
  onResetCreate?: () => void
}
