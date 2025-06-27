
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { usePracticeAreas } from '@/hooks/usePracticeAreas'
import { AdvancedTemplateData } from '@/types/templateTypes'
import { FileText, Scale, Home, Building, Users, Clock, Star, Target } from 'lucide-react'
import { useState } from 'react'

interface TemplateWizardStep1Props {
  formData: {
    name: string
    description: string
    practice_area_id: string
    template_data: AdvancedTemplateData
  }
  updateFormData: (updates: any) => void
  updateTemplateData: (updates: Partial<AdvancedTemplateData>) => void
  errors: Record<string, string>
}

const TEMPLATE_CATEGORIES = [
  { id: 'civil', name: 'Derecho Civil', icon: Scale },
  { id: 'mercantil', name: 'Derecho Mercantil', icon: Building },
  { id: 'laboral', name: 'Derecho Laboral', icon: Users },
  { id: 'penal', name: 'Derecho Penal', icon: Target },
  { id: 'administrativo', name: 'Administrativo', icon: Home },
  { id: 'fiscal', name: 'Derecho Fiscal', icon: FileText },
  { id: 'general', name: 'General', icon: Star }
]

const COMPLEXITY_LEVELS = [
  { id: 'basic', name: 'Básico', description: 'Expedientes simples, pocas etapas', color: 'bg-green-100 text-green-800' },
  { id: 'intermediate', name: 'Intermedio', description: 'Complejidad media, varias etapas', color: 'bg-yellow-100 text-yellow-800' },
  { id: 'advanced', name: 'Avanzado', description: 'Muy complejo, muchas etapas', color: 'bg-red-100 text-red-800' }
]

const TEMPLATE_ICONS = ['FileText', 'Scale', 'Building', 'Users', 'Home', 'Target', 'Star', 'Clock']
const TEMPLATE_COLORS = ['#0061FF', '#2CBD6E', '#FF9800', '#9C27B0', '#F44336', '#607D8B', '#795548', '#E91E63']

export function TemplateWizardStep1({ 
  formData, 
  updateFormData, 
  updateTemplateData, 
  errors 
}: TemplateWizardStep1Props) {
  const { practiceAreas = [] } = usePracticeAreas()
  const [newTag, setNewTag] = useState('')

  const handleAddTag = () => {
    if (newTag.trim() && !formData.template_data.tags.includes(newTag.trim())) {
      updateTemplateData({
        tags: [...formData.template_data.tags, newTag.trim()]
      })
      setNewTag('')
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    updateTemplateData({
      tags: formData.template_data.tags.filter(tag => tag !== tagToRemove)
    })
  }

  return (
    <div className="space-y-6">
      {/* Información básica */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Información Básica
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre de la Plantilla *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => updateFormData({ name: e.target.value })}
                placeholder="Ej: Divorcio de Mutuo Acuerdo, Constitución de SL..."
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
            </div>

            <div className="space-y-2">
              <Label>Área de Práctica</Label>
              <Select
                value={formData.practice_area_id}
                onValueChange={(value) => updateFormData({ practice_area_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar área..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sin área específica</SelectItem>
                  {practiceAreas.map((area) => (
                    <SelectItem key={area.id} value={area.id}>
                      {area.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              value={formData.description || ''}
              onChange={(e) => updateFormData({ description: e.target.value })}
              placeholder="Describe el tipo de expedientes para los que se utilizará esta plantilla..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Categorización y configuración */}
      <Card>
        <CardHeader>
          <CardTitle>Categorización y Estilo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Categoría */}
          <div className="space-y-3">
            <Label>Categoría *</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {TEMPLATE_CATEGORIES.map((category) => {
                const Icon = category.icon
                return (
                  <div
                    key={category.id}
                    className={`p-3 border-2 rounded-lg cursor-pointer transition-all hover:shadow-md ${
                      formData.template_data.category === category.id
                        ? 'border-primary bg-primary/5'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => updateTemplateData({ category: category.id })}
                  >
                    <Icon className="h-6 w-6 mb-2 mx-auto" />
                    <p className="text-sm font-medium text-center">{category.name}</p>
                  </div>
                )
              })}
            </div>
            {errors.category && <p className="text-sm text-red-500">{errors.category}</p>}
          </div>

          {/* Nivel de complejidad */}
          <div className="space-y-3">
            <Label>Nivel de Complejidad</Label>
            <div className="grid grid-cols-3 gap-3">
              {COMPLEXITY_LEVELS.map((level) => (
                <div
                  key={level.id}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all hover:shadow-md ${
                    formData.template_data.complexity === level.id
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => updateTemplateData({ complexity: level.id as any })}
                >
                  <div className={`inline-block px-2 py-1 rounded-full text-xs font-medium mb-2 ${level.color}`}>
                    {level.name}
                  </div>
                  <p className="text-sm text-gray-600">{level.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Duración estimada */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Duración Estimada (días)</Label>
              <Input
                type="number"
                value={formData.template_data.estimated_duration_days}
                onChange={(e) => updateTemplateData({ estimated_duration_days: parseInt(e.target.value) || 0 })}
                placeholder="30"
                min="1"
              />
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-3">
            <Label>Etiquetas</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.template_data.tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="cursor-pointer hover:bg-red-100"
                  onClick={() => handleRemoveTag(tag)}
                >
                  {tag} ×
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Añadir etiqueta..."
                onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
              />
              <Button type="button" variant="outline" onClick={handleAddTag}>
                Añadir
              </Button>
            </div>
          </div>

          {/* Icono y color */}
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label>Icono</Label>
              <div className="grid grid-cols-4 gap-2">
                {TEMPLATE_ICONS.map((iconName) => (
                  <div
                    key={iconName}
                    className={`p-3 border-2 rounded-lg cursor-pointer transition-all hover:shadow-md flex items-center justify-center ${
                      formData.template_data.icon === iconName
                        ? 'border-primary bg-primary/5'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => updateTemplateData({ icon: iconName })}
                  >
                    <FileText className="h-5 w-5" />
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <Label>Color</Label>
              <div className="grid grid-cols-4 gap-2">
                {TEMPLATE_COLORS.map((color) => (
                  <div
                    key={color}
                    className={`w-10 h-10 rounded-lg cursor-pointer border-2 transition-all hover:scale-110 ${
                      formData.template_data.color === color
                        ? 'border-gray-800 ring-2 ring-gray-400'
                        : 'border-gray-200'
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => updateTemplateData({ color })}
                  />
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
