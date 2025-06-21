
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { useClients } from '@/hooks/useClients'
import { useCases } from '@/hooks/useCases'

interface TaskAssignmentFieldsProps {
  formData: {
    case_id: string
    client_id: string
  }
  onInputChange: (field: string, value: string) => void
}

export const TaskAssignmentFields = ({ formData, onInputChange }: TaskAssignmentFieldsProps) => {
  const { clients } = useClients()
  const { cases } = useCases()

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="case_id">Caso</Label>
        <Select value={formData.case_id} onValueChange={(value) => onInputChange('case_id', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Seleccionar caso" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Sin caso</SelectItem>
            {cases?.map((caseItem) => (
              <SelectItem key={caseItem.id} value={caseItem.id}>
                {caseItem.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="client_id">Cliente</Label>
        <Select value={formData.client_id} onValueChange={(value) => onInputChange('client_id', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Seleccionar cliente" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Sin cliente</SelectItem>
            {clients?.map((client) => (
              <SelectItem key={client.id} value={client.id}>
                {client.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
