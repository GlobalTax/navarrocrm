import { useState } from 'react'
import { Plus, FileText, Edit, Trash2, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useApp } from '@/contexts/AppContext'
import { toast } from 'sonner'

interface DocumentTemplate {
  id: string
  name: string
  description: string
  document_type: string
  template_content: string
  variables: any[]
  requires_signature: boolean
  signature_fields: any[]
  is_mandatory: boolean
  sort_order: number
  is_active: boolean
}

interface TemplateForm {
  name: string
  description: string
  document_type: string
  template_content: string
  requires_signature: boolean
  is_mandatory: boolean
}

const DOCUMENT_TYPES = [
  { value: 'contract', label: 'Contrato de Trabajo' },
  { value: 'handbook', label: 'Manual del Empleado' },
  { value: 'policy', label: 'Política de Empresa' },
  { value: 'form', label: 'Formulario' },
  { value: 'agreement', label: 'Acuerdo' }
]

export const DocumentTemplateManager = () => {
  const { user } = useApp()
  const queryClient = useQueryClient()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<DocumentTemplate | null>(null)
  const [formData, setFormData] = useState<TemplateForm>({
    name: '',
    description: '',
    document_type: 'contract',
    template_content: '',
    requires_signature: false,
    is_mandatory: true
  })

  const { data: templates = [], isLoading } = useQuery({
    queryKey: ['document-templates', user?.org_id],
    queryFn: async () => {
      if (!user?.org_id) return []
      
      const { data, error } = await supabase
        .from('employee_document_templates')
        .select('*')
        .eq('org_id', user.org_id)
        .order('sort_order', { ascending: true })
      
      if (error) throw error
      return data as DocumentTemplate[]
    },
    enabled: !!user?.org_id
  })

  const createTemplate = useMutation({
    mutationFn: async (data: TemplateForm) => {
      if (!user?.org_id) throw new Error('No org_id')
      
      const { error } = await supabase
        .from('employee_document_templates')
        .insert({
          ...data,
          org_id: user.org_id,
          created_by: user.id,
          variables: extractVariables(data.template_content)
        })
      
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['document-templates'] })
      setIsDialogOpen(false)
      resetForm()
      toast.success('Template creado exitosamente')
    },
    onError: (error: any) => {
      toast.error('Error al crear template', {
        description: error.message
      })
    }
  })

  const updateTemplate = useMutation({
    mutationFn: async ({ id, data }: { id: string, data: TemplateForm }) => {
      const { error } = await supabase
        .from('employee_document_templates')
        .update({
          ...data,
          variables: extractVariables(data.template_content)
        })
        .eq('id', id)
      
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['document-templates'] })
      setIsDialogOpen(false)
      setEditingTemplate(null)
      resetForm()
      toast.success('Template actualizado exitosamente')
    },
    onError: (error: any) => {
      toast.error('Error al actualizar template', {
        description: error.message
      })
    }
  })

  const deleteTemplate = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('employee_document_templates')
        .delete()
        .eq('id', id)
      
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['document-templates'] })
      toast.success('Template eliminado')
    },
    onError: (error: any) => {
      toast.error('Error al eliminar template', {
        description: error.message
      })
    }
  })

  const extractVariables = (content: string) => {
    const regex = /\{\{(\w+)\}\}/g
    const variables = []
    let match
    
    while ((match = regex.exec(content)) !== null) {
      if (!variables.find(v => v.name === match[1])) {
        variables.push({
          name: match[1],
          label: match[1].replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          type: 'text',
          required: true
        })
      }
    }
    
    return variables
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      document_type: 'contract',
      template_content: '',
      requires_signature: false,
      is_mandatory: true
    })
  }

  const handleEdit = (template: DocumentTemplate) => {
    setEditingTemplate(template)
    setFormData({
      name: template.name,
      description: template.description || '',
      document_type: template.document_type,
      template_content: template.template_content,
      requires_signature: template.requires_signature,
      is_mandatory: template.is_mandatory
    })
    setIsDialogOpen(true)
  }

  const handleSubmit = () => {
    if (editingTemplate) {
      updateTemplate.mutate({ id: editingTemplate.id, data: formData })
    } else {
      createTemplate.mutate(formData)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">Templates de Documentos</h2>
          <p className="text-muted-foreground">
            Gestiona los documentos que se generarán durante el onboarding
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Template
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingTemplate ? 'Editar Template' : 'Nuevo Template'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nombre *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Contrato de Trabajo"
                  />
                </div>
                <div>
                  <Label htmlFor="document_type">Tipo de Documento</Label>
                  <Select 
                    value={formData.document_type} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, document_type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DOCUMENT_TYPES.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Descripción del documento..."
                  rows={2}
                />
              </div>

              <div>
                <Label htmlFor="template_content">Contenido del Template *</Label>
                <Textarea
                  id="template_content"
                  value={formData.template_content}
                  onChange={(e) => setFormData(prev => ({ ...prev, template_content: e.target.value }))}
                  placeholder="Contenido HTML del documento. Usa {{variable}} para campos dinámicos."
                  rows={10}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Variables disponibles: &#123;&#123;first_name&#125;&#125;, &#123;&#123;last_name&#125;&#125;, &#123;&#123;dni&#125;&#125;, &#123;&#123;email&#125;&#125;, &#123;&#123;position_title&#125;&#125;, &#123;&#123;start_date&#125;&#125;
                </p>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="requires_signature"
                    checked={formData.requires_signature}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, requires_signature: checked }))}
                  />
                  <Label htmlFor="requires_signature">Requiere Firma Digital</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_mandatory"
                    checked={formData.is_mandatory}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_mandatory: checked }))}
                  />
                  <Label htmlFor="is_mandatory">Obligatorio</Label>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button 
                  onClick={handleSubmit}
                  disabled={!formData.name || !formData.template_content}
                >
                  {editingTemplate ? 'Actualizar' : 'Crear'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-20 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((template) => (
            <Card key={template.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-base flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      {template.name}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {DOCUMENT_TYPES.find(t => t.value === template.document_type)?.label}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(template)}>
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => deleteTemplate.mutate(template.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {template.description && (
                  <p className="text-sm text-muted-foreground mb-3">
                    {template.description}
                  </p>
                )}
                <div className="flex flex-wrap gap-1">
                  {template.requires_signature && (
                    <Badge variant="secondary" className="text-xs">
                      Firma Digital
                    </Badge>
                  )}
                  {template.is_mandatory && (
                    <Badge variant="default" className="text-xs">
                      Obligatorio
                    </Badge>
                  )}
                  {template.variables && template.variables.length > 0 && (
                    <Badge variant="outline" className="text-xs">
                      {template.variables.length} variables
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!isLoading && templates.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">No hay templates</h3>
            <p className="text-muted-foreground mb-4">
              Crea tu primer template de documento para el onboarding
            </p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Crear Template
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}