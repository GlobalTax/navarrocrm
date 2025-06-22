
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useClients } from '@/hooks/useClients'
import { usePracticeAreas } from '@/hooks/usePracticeAreas'
import { useMatterTemplates } from '@/hooks/useMatterTemplates'
import { WizardFormData } from './MatterWizard'
import { AlertCircle, FileText } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface WizardStep1Props {
  formData: WizardFormData
  updateFormData: (updates: Partial<WizardFormData>) => void
  errors: Record<string, string>
}

export function WizardStep1({ formData, updateFormData, errors }: WizardStep1Props) {
  const { clients = [] } = useClients()
  const { practiceAreas = [] } = usePracticeAreas()
  const { templates = [] } = useMatterTemplates()

  const handleTemplateChange = (templateId: string) => {
    updateFormData({ template_selection: templateId })
    
    if (templateId !== 'none') {
      const template = templates.find(t => t.id === templateId)
      if (template) {
        // Auto-llenar campos basados en la plantilla
        const updates: Partial<WizardFormData> = {}
        
        if (template.default_billing_method) {
          updates.billing_method = template.default_billing_method
        }
        
        if (template.template_data) {
          const templateData = template.template_data as any
          if (templateData.default_title && !formData.title) {
            updates.title = templateData.default_title
          }
          if (templateData.default_description && !formData.description) {
            updates.description = templateData.default_description
          }
        }
        
        updateFormData(updates)
      }
    }
  }

  return (
    <div className="space-y-6">
      {/* Plantilla rápida */}
      {templates.length > 0 && (
        <Card className="border-blue-200 bg-blue-50/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="h-4 w-4 text-blue-600" />
              Crear desde plantilla (opcional)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={formData.template_selection} onValueChange={handleTemplateChange}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar plantilla para auto-completar..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Sin plantilla</SelectItem>
                {templates.map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      )}

      {/* Información básica */}
      <Card>
        <CardHeader>
          <CardTitle>Información Básica</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="client_id">Cliente *</Label>
              <Select 
                value={formData.client_id} 
                onValueChange={(value) => updateFormData({ client_id: value })}
              >
                <SelectTrigger className={errors.client_id ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Seleccionar cliente..." />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      <div className="flex flex-col">
                        <span className="font-medium">{client.name}</span>
                        {client.email && (
                          <span className="text-xs text-muted-foreground">{client.email}</span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.client_id && (
                <p className="text-sm text-red-500">{errors.client_id}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="practice_area">Área de Práctica</Label>
              <Select 
                value={formData.practice_area || 'none'} 
                onValueChange={(value) => updateFormData({ practice_area: value === 'none' ? '' : value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar área..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sin especificar</SelectItem>
                  {practiceAreas.map((area) => (
                    <SelectItem key={area.id} value={area.name}>
                      {area.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Título del Expediente *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => updateFormData({ title: e.target.value })}
              placeholder="Ej: Compraventa inmueble - Juan Pérez"
              className={errors.title ? 'border-red-500' : ''}
            />
            {errors.title && (
              <p className="text-sm text-red-500">{errors.title}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              value={formData.description || ''}
              onChange={(e) => updateFormData({ description: e.target.value })}
              placeholder="Descripción detallada del expediente..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Tips para el usuario */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Tip:</strong> Un título descriptivo te ayudará a encontrar rápidamente este expediente. 
          Incluye el tipo de servicio y el nombre del cliente.
        </AlertDescription>
      </Alert>
    </div>
  )
}
