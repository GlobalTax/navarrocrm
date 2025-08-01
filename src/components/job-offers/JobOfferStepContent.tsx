import React from 'react'
import { JobOfferStep, JobOfferFormData, PositionLevel, WorkSchedule } from '@/types/job-offers'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { Plus, X } from 'lucide-react'

interface JobOfferStepContentProps {
  step: JobOfferStep
  formData: JobOfferFormData
  onUpdate: (stepId: string, data: Partial<JobOfferFormData>) => void
}

export function JobOfferStepContent({ step, formData, onUpdate }: JobOfferStepContentProps) {
  const handleInputChange = (field: string, value: any) => {
    onUpdate(step.id, { [field]: value })
  }

  const addListItem = (field: keyof JobOfferFormData) => {
    const currentList = formData[field] as string[]
    onUpdate(step.id, { [field]: [...currentList, ''] })
  }

  const updateListItem = (field: keyof JobOfferFormData, index: number, value: string) => {
    const currentList = formData[field] as string[]
    const newList = [...currentList]
    newList[index] = value
    onUpdate(step.id, { [field]: newList })
  }

  const removeListItem = (field: keyof JobOfferFormData, index: number) => {
    const currentList = formData[field] as string[]
    onUpdate(step.id, { [field]: currentList.filter((_, i) => i !== index) })
  }

  const renderListField = (field: keyof JobOfferFormData, label: string, placeholder: string) => {
    const items = formData[field] as string[]
    
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-base font-medium">{label}</Label>
          <Button 
            type="button" 
            variant="outline" 
            size="sm"
            onClick={() => addListItem(field)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Agregar
          </Button>
        </div>
        <div className="space-y-2">
          {items.map((item, index) => (
            <div key={index} className="flex gap-2">
              <Input
                value={item}
                onChange={(e) => updateListItem(field, index, e.target.value)}
                placeholder={placeholder}
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => removeListItem(field, index)}
                className="px-3"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
          {items.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No hay elementos. Haz clic en "Agregar" para añadir uno.
            </p>
          )}
        </div>
      </div>
    )
  }

  switch (step.id) {
    case 'basic-info':
      return (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="title">Título del Puesto *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="ej. Desarrollador Frontend Senior"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="department">Departamento</Label>
              <Input
                id="department"
                value={formData.department}
                onChange={(e) => handleInputChange('department', e.target.value)}
                placeholder="ej. Tecnología"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="position_level">Nivel del Puesto *</Label>
            <Select 
              value={formData.position_level} 
              onValueChange={(value) => handleInputChange('position_level', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona el nivel" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="junior">Junior</SelectItem>
                <SelectItem value="senior">Senior</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="director">Director</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">Información del Candidato</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="candidate_name">Nombre Completo *</Label>
                <Input
                  id="candidate_name"
                  value={formData.candidate_name}
                  onChange={(e) => handleInputChange('candidate_name', e.target.value)}
                  placeholder="Nombre y apellidos"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="candidate_email">Email *</Label>
                <Input
                  id="candidate_email"
                  type="email"
                  value={formData.candidate_email}
                  onChange={(e) => handleInputChange('candidate_email', e.target.value)}
                  placeholder="email@ejemplo.com"
                />
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <Label htmlFor="candidate_phone">Teléfono</Label>
              <Input
                id="candidate_phone"
                value={formData.candidate_phone}
                onChange={(e) => handleInputChange('candidate_phone', e.target.value)}
                placeholder="+34 600 000 000"
              />
            </div>
          </div>
        </div>
      )

    case 'salary-conditions':
      return (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="salary_amount">Salario *</Label>
              <Input
                id="salary_amount"
                type="number"
                value={formData.salary_amount}
                onChange={(e) => handleInputChange('salary_amount', parseFloat(e.target.value) || 0)}
                placeholder="50000"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="salary_currency">Moneda</Label>
              <Select 
                value={formData.salary_currency} 
                onValueChange={(value) => handleInputChange('salary_currency', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EUR">EUR (€)</SelectItem>
                  <SelectItem value="USD">USD ($)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="salary_period">Período</Label>
              <Select 
                value={formData.salary_period} 
                onValueChange={(value) => handleInputChange('salary_period', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Mensual</SelectItem>
                  <SelectItem value="annual">Anual</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="work_schedule">Tipo de Jornada *</Label>
            <Select 
              value={formData.work_schedule} 
              onValueChange={(value) => handleInputChange('work_schedule', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="full_time">Tiempo Completo</SelectItem>
                <SelectItem value="part_time">Tiempo Parcial</SelectItem>
                <SelectItem value="hybrid">Híbrido</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )

    case 'work-conditions':
      return (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="start_date">Fecha de Inicio</Label>
              <Input
                id="start_date"
                type="date"
                value={formData.start_date}
                onChange={(e) => handleInputChange('start_date', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vacation_days">Días de Vacaciones</Label>
              <Input
                id="vacation_days"
                type="number"
                value={formData.vacation_days}
                onChange={(e) => handleInputChange('vacation_days', parseInt(e.target.value) || 22)}
                placeholder="22"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="work_location">Ubicación de Trabajo</Label>
            <Input
              id="work_location"
              value={formData.work_location}
              onChange={(e) => handleInputChange('work_location', e.target.value)}
              placeholder="Madrid, España"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="remote_work"
              checked={formData.remote_work_allowed}
              onCheckedChange={(checked) => handleInputChange('remote_work_allowed', checked)}
            />
            <Label htmlFor="remote_work">Trabajo remoto permitido</Label>
          </div>

          <div className="space-y-2">
            <Label htmlFor="probation_period">Período de Prueba (meses)</Label>
            <Input
              id="probation_period"
              type="number"
              value={formData.probation_period_months}
              onChange={(e) => handleInputChange('probation_period_months', parseInt(e.target.value) || 6)}
              placeholder="6"
            />
          </div>
        </div>
      )

    case 'responsibilities':
      return (
        <div className="space-y-6">
          {renderListField('responsibilities', 'Responsabilidades', 'Describir una responsabilidad')}
          {renderListField('requirements', 'Requisitos', 'Describir un requisito')}
        </div>
      )

    case 'benefits':
      return (
        <div className="space-y-6">
          {renderListField('benefits', 'Beneficios', 'Describir un beneficio')}
          
          <div className="space-y-2">
            <Label htmlFor="additional_notes">Notas Adicionales</Label>
            <Textarea
              id="additional_notes"
              value={formData.additional_notes}
              onChange={(e) => handleInputChange('additional_notes', e.target.value)}
              placeholder="Información adicional relevante para el candidato..."
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="expires_in_days">Válida por (días)</Label>
            <Input
              id="expires_in_days"
              type="number"
              value={formData.expires_in_days}
              onChange={(e) => handleInputChange('expires_in_days', parseInt(e.target.value) || 7)}
              placeholder="7"
            />
          </div>
        </div>
      )

    case 'review':
      return (
        <div className="space-y-6">
          <div className="bg-muted/50 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Resumen de la Oferta</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <strong>Puesto:</strong> {formData.title}
              </div>
              <div>
                <strong>Candidato:</strong> {formData.candidate_name}
              </div>
              <div>
                <strong>Salario:</strong> {formData.salary_amount} {formData.salary_currency} ({formData.salary_period === 'annual' ? 'anual' : 'mensual'})
              </div>
              <div>
                <strong>Departamento:</strong> {formData.department || 'No especificado'}
              </div>
              <div>
                <strong>Nivel:</strong> {formData.position_level}
              </div>
              <div>
                <strong>Email:</strong> {formData.candidate_email}
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                Revisa todos los datos antes de crear la oferta. Podrás modificarla después si es necesario.
              </p>
            </div>
          </div>
        </div>
      )

    default:
      return <div>Paso no encontrado</div>
  }
}