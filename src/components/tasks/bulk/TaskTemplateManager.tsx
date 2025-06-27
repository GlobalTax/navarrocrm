
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useTaskTemplates, TaskTemplateInsert } from '@/hooks/tasks/useTaskTemplates'
import { 
  Plus, 
  Edit, 
  Trash2, 
  Copy,
  Save,
  X
} from 'lucide-react'

// Tipo para el formulario local (sin campos requeridos de DB)
interface TaskTemplateFormData {
  name: string
  description: string
  template_data: {
    title: string
    description?: string
    priority: 'low' | 'medium' | 'high' | 'urgent'
    status: 'pending' | 'in_progress'
    estimated_hours: number
  }
  category: string
}

// Helper para validar y convertir template_data
const parseTemplateData = (data: any): TaskTemplateFormData['template_data'] => {
  if (!data || typeof data !== 'object') {
    return {
      title: '',
      description: '',
      priority: 'medium',
      status: 'pending',
      estimated_hours: 1
    }
  }

  return {
    title: data.title || '',
    description: data.description || '',
    priority: data.priority || 'medium',
    status: data.status || 'pending',
    estimated_hours: data.estimated_hours || 1
  }
}

export const TaskTemplateManager = () => {
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<any>(null)
  const [formData, setFormData] = useState<TaskTemplateFormData>({
    name: '',
    description: '',
    template_data: {
      title: '',
      description: '',
      priority: 'medium',
      status: 'pending',
      estimated_hours: 1
    },
    category: 'general'
  })

  const { templates, isLoading, createTemplate, updateTemplate, deleteTemplate } = useTaskTemplates()

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      template_data: {
        title: '',
        description: '',
        priority: 'medium',
        status: 'pending',
        estimated_hours: 1
      },
      category: 'general'
    })
    setEditingTemplate(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      if (editingTemplate) {
        await updateTemplate.mutateAsync({
          id: editingTemplate.id,
          ...formData,
          template_data: formData.template_data as any // Safe cast aquí
        })
      } else {
        await createTemplate.mutateAsync({
          ...formData,
          template_data: formData.template_data as any // Safe cast aquí
        })
      }
      
      resetForm()
      setIsCreateOpen(false)
    } catch (error) {
      console.error('Error saving template:', error)
    }
  }

  const handleEdit = (template: any) => {
    const templateData = parseTemplateData(template.template_data)
    
    setFormData({
      name: template.name,
      description: template.description || '',
      template_data: templateData,
      category: template.category
    })
    setEditingTemplate(template)
    setIsCreateOpen(true)
  }

  const handleDuplicate = (template: any) => {
    const templateData = parseTemplateData(template.template_data)
    
    setFormData({
      name: `${template.name} (Copia)`,
      description: template.description || '',
      template_data: templateData,
      category: template.category
    })
    setEditingTemplate(null)
    setIsCreateOpen(true)
  }

  const categories = Array.from(new Set(templates.map(t => t.category))).filter(Boolean)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Plantillas de Tareas</h3>
          <p className="text-sm text-gray-600">
            Crea y administra plantillas reutilizables para tareas comunes
          </p>
        </div>
        
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Nueva Plantilla
            </Button>
          </DialogTrigger>
          
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingTemplate ? 'Editar Plantilla' : 'Nueva Plantilla'}
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nombre de la Plantilla *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="category">Categoría</Label>
                  <Select 
                    value={formData.category} 
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="legal">Legal</SelectItem>
                      <SelectItem value="admin">Administrativa</SelectItem>
                      <SelectItem value="client">Cliente</SelectItem>
                      <SelectItem value="development">Desarrollo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={2}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="task-title">Título de la Tarea *</Label>
                  <Input
                    id="task-title"
                    value={formData.template_data.title}
                    onChange={(e) => setFormData({
                      ...formData,
                      template_data: { ...formData.template_data, title: e.target.value }
                    })}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="estimated-hours">Horas Estimadas</Label>
                  <Input
                    id="estimated-hours"
                    type="number"
                    min="0.5"
                    step="0.5"
                    value={formData.template_data.estimated_hours}
                    onChange={(e) => setFormData({
                      ...formData,
                      template_data: { ...formData.template_data, estimated_hours: parseFloat(e.target.value) }
                    })}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="task-description">Descripción de la Tarea</Label>
                <Textarea
                  id="task-description"
                  value={formData.template_data.description}
                  onChange={(e) => setFormData({
                    ...formData,
                    template_data: { ...formData.template_data, description: e.target.value }
                  })}
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Prioridad</Label>
                  <Select 
                    value={formData.template_data.priority} 
                    onValueChange={(value: any) => setFormData({
                      ...formData,
                      template_data: { ...formData.template_data, priority: value }
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Baja</SelectItem>
                      <SelectItem value="medium">Media</SelectItem>
                      <SelectItem value="high">Alta</SelectItem>
                      <SelectItem value="urgent">Urgente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Estado Inicial</Label>
                  <Select 
                    value={formData.template_data.status} 
                    onValueChange={(value: any) => setFormData({
                      ...formData,
                      template_data: { ...formData.template_data, status: value }
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pendiente</SelectItem>
                      <SelectItem value="in_progress">En Progreso</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="flex items-center justify-end gap-2 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsCreateOpen(false)}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancelar
                </Button>
                <Button 
                  type="submit"
                  disabled={createTemplate.isPending || updateTemplate.isPending}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {editingTemplate ? 'Actualizar' : 'Crear'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map((template) => {
          const templateData = parseTemplateData(template.template_data)
          
          return (
            <Card key={template.id} className="hover:shadow-sm transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{template.name}</CardTitle>
                  <Badge variant="outline">{template.category}</Badge>
                </div>
                {template.description && (
                  <p className="text-sm text-gray-600">{template.description}</p>
                )}
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="space-y-2 mb-4">
                  <div className="text-sm">
                    <span className="font-medium">Título:</span> {templateData.title}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant={templateData.priority === 'high' ? 'destructive' : 'secondary'}
                      className="text-xs"
                    >
                      {templateData.priority}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {templateData.status}
                    </Badge>
                    {templateData.estimated_hours && (
                      <Badge variant="outline" className="text-xs">
                        {templateData.estimated_hours}h
                      </Badge>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(template)}
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDuplicate(template)}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => deleteTemplate.mutate(template.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {templates.length === 0 && !isLoading && (
        <Card>
          <CardContent className="py-12 text-center">
            <Plus className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No hay plantillas creadas
            </h3>
            <p className="text-gray-500 mb-4">
              Crea tu primera plantilla para agilizar la creación de tareas
            </p>
            <Button onClick={() => setIsCreateOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Crear Primera Plantilla
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
