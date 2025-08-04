import { Alert, AlertDescription } from '@/components/ui/alert'
import { Info } from 'lucide-react'
import { MatterTemplateSelector } from '../forms/MatterTemplateSelector'
import { MatterDetailsForm } from '../forms/MatterDetailsForm'
import { useClients } from '@/hooks/useClients'
import { usePracticeAreas } from '@/hooks/usePracticeAreas'
import { useMatterTemplates } from '@/hooks/useMatterTemplates'
import { WizardFormData } from './types'

interface WizardStep1Props {
  formData: WizardFormData
  updateFormData: (updates: Partial<WizardFormData>) => void
  errors: Record<string, string>
}

export function WizardStep1({
  formData,
  updateFormData,
  errors
}: WizardStep1Props) {
  const { clients } = useClients()
  const { practiceAreas } = usePracticeAreas()
  const { templates } = useMatterTemplates()

  const handleTemplateChange = (templateId: string) => {
    updateFormData({ template_selection: templateId })
    
    if (templateId !== 'none') {
      const template = templates.find(t => t.id === templateId)
      if (template) {
        updateFormData({
          practice_area: template.practice_area?.name || '',
          billing_method: (template.default_billing_method as 'hourly' | 'fixed' | 'contingency' | 'retainer') || 'hourly'
        })
      }
    }
  }

  return (
    <div className="space-y-6">
      <MatterTemplateSelector
        templates={templates}
        selectedTemplate={formData.template_selection}
        onTemplateChange={handleTemplateChange}
      />

      <MatterDetailsForm
        title={formData.title}
        description={formData.description || ''}
        clientId={formData.contact_id}
        practiceArea={formData.practice_area || ''}
        responsibleSolicitorId={formData.responsible_solicitor_id || ''}
        status={formData.status}
        onTitleChange={(value) => updateFormData({ title: value })}
        onDescriptionChange={(value) => updateFormData({ description: value })}
        onClientChange={(value) => updateFormData({ contact_id: value })}
        onPracticeAreaChange={(value) => updateFormData({ practice_area: value })}
        onResponsibleSolicitorChange={(value) => updateFormData({ responsible_solicitor_id: value })}
        onStatusChange={(value) => updateFormData({ status: value as any })}
      />

      {Object.keys(errors).length > 0 && (
        <div className="space-y-2">
          {Object.entries(errors).map(([field, error]) => (
            <p key={field} className="text-sm text-red-600">
              {error}
            </p>
          ))}
        </div>
      )}

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Consejo: Selecciona una plantilla para autocompletar algunos campos del expediente.
        </AlertDescription>
      </Alert>
    </div>
  )
}