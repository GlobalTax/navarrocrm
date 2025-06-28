
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { useContacts } from '@/hooks/useContacts'
import { useCases } from '@/hooks/useCases'

interface TaskAssignmentFieldsProps {
  formData: {
    case_id: string
    contact_id: string
  }
  onInputChange: (field: string, value: string) => void
}

export const TaskAssignmentFields = ({ formData, onInputChange }: TaskAssignmentFieldsProps) => {
  const { contacts } = useContacts()
  const { cases } = useCases()

  const handleCaseChange = (value: string) => {
    const finalValue = value === 'none' ? '' : value
    onInputChange('case_id', finalValue)
  }

  const handleContactChange = (value: string) => {
    const finalValue = value === 'none' ? '' : value
    onInputChange('contact_id', finalValue)
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="case_id">Expediente</Label>
          <Select value={formData.case_id || 'none'} onValueChange={handleCaseChange}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar expediente" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Sin expediente</SelectItem>
              {cases?.map((caseItem) => (
                <SelectItem key={caseItem.id} value={caseItem.id}>
                  {caseItem.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="contact_id">Contacto</Label>
          <Select value={formData.contact_id || 'none'} onValueChange={handleContactChange}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar contacto" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Sin contacto</SelectItem>
              {contacts?.map((contact) => (
                <SelectItem key={contact.id} value={contact.id}>
                  {contact.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
}
