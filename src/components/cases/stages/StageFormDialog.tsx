
import React from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { CalendarIcon } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { useForm } from 'react-hook-form'
import { CreateMatterStageData, MatterStage } from '@/hooks/useMatterStages'

interface StageFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: CreateMatterStageData) => void
  isLoading?: boolean
  caseId: string
  stage?: MatterStage | null
  title?: string
}

export const StageFormDialog: React.FC<StageFormDialogProps> = ({
  open,
  onOpenChange,
  onSubmit,
  isLoading = false,
  caseId,
  stage,
  title = 'Nueva Etapa'
}) => {
  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<CreateMatterStageData>({
    defaultValues: {
      name: stage?.name || '',
      description: stage?.description || '',
      case_id: caseId,
      due_date: stage?.due_date || '',
    }
  })

  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(
    stage?.due_date ? new Date(stage.due_date) : undefined
  )

  React.useEffect(() => {
    if (stage) {
      setValue('name', stage.name)
      setValue('description', stage.description || '')
      setValue('due_date', stage.due_date || '')
      setSelectedDate(stage.due_date ? new Date(stage.due_date) : undefined)
    }
  }, [stage, setValue])

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date)
    setValue('due_date', date ? date.toISOString().split('T')[0] : '')
  }

  const handleFormSubmit = (data: CreateMatterStageData) => {
    onSubmit(data)
    reset()
    setSelectedDate(undefined)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {stage ? 'Edita los detalles de la etapa' : 'Crea una nueva etapa para el expediente'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre de la etapa *</Label>
            <Input
              id="name"
              {...register('name', { required: 'El nombre es requerido' })}
              placeholder="Ej: Revisión inicial, Preparación de documentos..."
            />
            {errors.name && (
              <p className="text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Describe qué se debe hacer en esta etapa..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Fecha límite</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? (
                    format(selectedDate, 'PPP', { locale: es })
                  ) : (
                    <span>Seleccionar fecha</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={handleDateSelect}
                  initialFocus
                  locale={es}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Guardando...' : stage ? 'Actualizar' : 'Crear'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
