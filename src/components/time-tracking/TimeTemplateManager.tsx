
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Clock, Edit, Trash2, Zap } from 'lucide-react'
import { useCasesList } from '@/features/cases'

interface TimeTemplate {
  id: string
  name: string
  description: string
  case_id?: string
  is_billable: boolean
  estimated_duration?: number
  category: string
}

interface TimeTemplateManagerProps {
  onUseTemplate: (template: TimeTemplate) => void
}

export const TimeTemplateManager = ({ onUseTemplate }: TimeTemplateManagerProps) => {
  const [templates, setTemplates] = useState<TimeTemplate[]>([
    {
      id: '1',
      name: 'Revisión de documentos',
      description: 'Revisión y análisis de documentación legal',
      is_billable: true,
      estimated_duration: 30,
      category: 'Documentación'
    },
    {
      id: '2',
      name: 'Llamada con cliente',
      description: 'Consulta telefónica con cliente',
      is_billable: true,
      estimated_duration: 15,
      category: 'Comunicación'
    },
    {
      id: '3',
      name: 'Investigación jurídica',
      description: 'Investigación de precedentes y normativa',
      is_billable: true,
      estimated_duration: 60,
      category: 'Investigación'
    }
  ])
  
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const { cases } = useCasesList()

  const [newTemplate, setNewTemplate] = useState<Partial<TimeTemplate>>({
    name: '',
    description: '',
    is_billable: true,
    category: 'General'
  })

  const categories = ['Documentación', 'Comunicación', 'Investigación', 'Reuniones', 'Trámites', 'General']

  const handleCreateTemplate = () => {
    if (!newTemplate.name) return

    const template: TimeTemplate = {
      id: Date.now().toString(),
      name: newTemplate.name,
      description: newTemplate.description || '',
      case_id: newTemplate.case_id,
      is_billable: newTemplate.is_billable ?? true,
      estimated_duration: newTemplate.estimated_duration,
      category: newTemplate.category || 'General'
    }

    setTemplates(prev => [...prev, template])
    setNewTemplate({ name: '', description: '', is_billable: true, category: 'General' })
    setIsCreateOpen(false)
  }

  const filteredTemplates = templates.filter(template => 
    selectedCategory === 'all' || template.category === selectedCategory
  )

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Documentación': 'bg-blue-100 text-blue-800',
      'Comunicación': 'bg-green-100 text-green-800',
      'Investigación': 'bg-purple-100 text-purple-800',
      'Reuniones': 'bg-orange-100 text-orange-800',
      'Trámites': 'bg-red-100 text-red-800',
      'General': 'bg-gray-100 text-gray-800'
    }
    return colors[category] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold">Plantillas de Tiempo</h3>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-1" />
              Nueva Plantilla
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Crear Plantilla de Tiempo</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="template-name">Nombre</Label>
                <Input
                  id="template-name"
                  value={newTemplate.name}
                  onChange={(e) => setNewTemplate(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="ej. Revisión de contrato"
                />
              </div>
              
              <div>
                <Label htmlFor="template-description">Descripción</Label>
                <Textarea
                  id="template-description"
                  value={newTemplate.description}
                  onChange={(e) => setNewTemplate(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Descripción detallada de la actividad"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="template-category">Categoría</Label>
                <Select 
                  value={newTemplate.category} 
                  onValueChange={(value) => setNewTemplate(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="template-case">Caso (Opcional)</Label>
                <Select 
                  value={newTemplate.case_id || 'none'} 
                  onValueChange={(value) => setNewTemplate(prev => ({ ...prev, case_id: value === 'none' ? undefined : value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar caso..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Sin caso específico</SelectItem>
                    {cases.map(case_ => (
                      <SelectItem key={case_.id} value={case_.id}>
                        {case_.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="template-duration">Duración estimada (minutos)</Label>
                <Input
                  id="template-duration"
                  type="number"
                  value={newTemplate.estimated_duration || ''}
                  onChange={(e) => setNewTemplate(prev => ({ 
                    ...prev, 
                    estimated_duration: e.target.value ? parseInt(e.target.value) : undefined 
                  }))}
                  placeholder="30"
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="template-billable">Tiempo facturable</Label>
                <Switch
                  id="template-billable"
                  checked={newTemplate.is_billable}
                  onCheckedChange={(checked) => setNewTemplate(prev => ({ ...prev, is_billable: checked }))}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleCreateTemplate}>
                  Crear Plantilla
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filtros por categoría */}
      <div className="flex gap-2 flex-wrap">
        <Button
          size="sm"
          variant={selectedCategory === 'all' ? 'default' : 'outline'}
          onClick={() => setSelectedCategory('all')}
        >
          Todas
        </Button>
        {categories.map(category => (
          <Button
            key={category}
            size="sm"
            variant={selectedCategory === category ? 'default' : 'outline'}
            onClick={() => setSelectedCategory(category)}
          >
            {category}
          </Button>
        ))}
      </div>

      {/* Lista de plantillas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filteredTemplates.map(template => (
          <Card key={template.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <CardTitle className="text-sm font-medium">{template.name}</CardTitle>
                <Badge className={getCategoryColor(template.category)}>
                  {template.category}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm text-gray-600 mb-3">{template.description}</p>
              
              <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                {template.estimated_duration && (
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {template.estimated_duration} min
                  </div>
                )}
                <div className={`px-2 py-1 rounded ${template.is_billable ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                  {template.is_billable ? 'Facturable' : 'No facturable'}
                </div>
              </div>

              <Button
                size="sm"
                onClick={() => onUseTemplate(template)}
                className="w-full"
              >
                <Zap className="h-3 w-3 mr-1" />
                Usar Plantilla
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
