
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface TaskDateFieldsProps {
  formData: {
    start_date: string
    due_date: string
  }
  onInputChange: (field: string, value: string) => void
}

export const TaskDateFields = ({ formData, onInputChange }: TaskDateFieldsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="start_date">Fecha de Inicio</Label>
        <Input
          id="start_date"
          type="date"
          value={formData.start_date}
          onChange={(e) => onInputChange('start_date', e.target.value)}
          className="border-0.5 border-black rounded-[10px]"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="due_date">Fecha Límite</Label>
        <Input
          id="due_date"
          type="date"
          value={formData.due_date}
          onChange={(e) => onInputChange('due_date', e.target.value)}
          className="border-0.5 border-black rounded-[10px]"
        />
      </div>
    </div>
  )
}
