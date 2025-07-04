import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Bot } from 'lucide-react'

interface DocumentBasicInfoProps {
  formData: {
    title: string
    caseId: string
    contactId: string
    useAI: boolean
  }
  onFormDataChange: (field: string, value: any) => void
  cases: any[]
  contacts: any[]
  isAiEnhanced: boolean
  onCaseSelect: (caseId: string) => void
  onContactSelect: (contactId: string) => void
}

export const DocumentBasicInfo = ({
  formData,
  onFormDataChange,
  cases,
  contacts,
  isAiEnhanced,
  onCaseSelect,
  onContactSelect
}: DocumentBasicInfoProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Información del Documento</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">Título del Documento</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => onFormDataChange('title', e.target.value)}
            required
            placeholder="Nombre del documento..."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="case">Expediente (Opcional)</Label>
            <Select
              value={formData.caseId}
              onValueChange={(value) => {
                onFormDataChange('caseId', value)
                onCaseSelect(value)
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar expediente" />
              </SelectTrigger>
              <SelectContent>
                {cases.map((case_) => (
                  <SelectItem key={case_.id} value={case_.id}>
                    {case_.matter_number} - {case_.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact">Cliente (Opcional)</Label>
            <Select
              value={formData.contactId}
              onValueChange={(value) => {
                onFormDataChange('contactId', value)
                onContactSelect(value)
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar cliente" />
              </SelectTrigger>
              <SelectContent>
                {contacts.map((contact) => (
                  <SelectItem key={contact.id} value={contact.id}>
                    {contact.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {isAiEnhanced && (
          <div className="flex items-center space-x-2">
            <Switch
              id="use_ai"
              checked={formData.useAI}
              onCheckedChange={(checked) => onFormDataChange('useAI', checked)}
            />
            <Label htmlFor="use_ai" className="flex items-center gap-2">
              <Bot className="h-4 w-4" />
              Usar IA para mejorar el contenido
            </Label>
          </div>
        )}
      </CardContent>
    </Card>
  )
}