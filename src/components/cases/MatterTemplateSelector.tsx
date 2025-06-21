
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { FileText } from 'lucide-react'
import { MatterTemplate } from '@/hooks/useMatterTemplates'

interface MatterTemplateSelectorProps {
  templates: MatterTemplate[]
  selectedTemplate: string
  onTemplateChange: (value: string) => void
}

export function MatterTemplateSelector({ 
  templates, 
  selectedTemplate, 
  onTemplateChange 
}: MatterTemplateSelectorProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Información de Plantilla
        </CardTitle>
        <CardDescription>
          Selecciona una plantilla para pre-configurar el expediente
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-2">
          <Label>Plantilla de Expediente</Label>
          <Select value={selectedTemplate} onValueChange={onTemplateChange}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar plantilla..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Sin plantilla</SelectItem>
              {templates.map((template) => (
                <SelectItem key={template.id} value={template.id}>
                  <div className="flex items-center gap-2">
                    <span>{template.name}</span>
                    {template.practice_area && (
                      <Badge variant="outline" className="text-xs">
                        {template.practice_area.name}
                      </Badge>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  )
}
