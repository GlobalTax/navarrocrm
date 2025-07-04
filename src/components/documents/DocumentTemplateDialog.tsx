import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, X, Bot } from 'lucide-react'
import { useDocumentTemplates, type TemplateVariable } from '@/hooks/useDocumentTemplates'

interface DocumentTemplateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  template?: any // Para edición futura
}

export const DocumentTemplateDialog = ({
  open,
  onOpenChange,
  template
}: DocumentTemplateDialogProps) => {
  const { createTemplate, updateTemplate } = useDocumentTemplates()
  const [formData, setFormData] = useState({
    name: template?.name || '',
    description: template?.description || '',
    document_type: template?.document_type || 'contract',
    category: template?.category || '',
    practice_area: template?.practice_area || '',
    template_content: template?.template_content || '',
    is_ai_enhanced: template?.is_ai_enhanced || false,
    variables: template?.variables || []
  })

  const [newVariable, setNewVariable] = useState<TemplateVariable>({
    name: '',
    type: 'text',
    required: true,
    label: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (template) {
      // Editando plantilla existente
      await updateTemplate.mutateAsync({
        id: template.id,
        updates: {
          ...formData,
          is_active: true
        }
      })
    } else {
      // Creando nueva plantilla
      await createTemplate.mutateAsync({
        ...formData,
        is_active: true
      })
    }
    
    onOpenChange(false)
    // Reset form
    setFormData({
      name: '',
      description: '',
      document_type: 'contract',
      category: '',
      practice_area: '',
      template_content: '',
      is_ai_enhanced: false,
      variables: []
    })
  }

  const addVariable = () => {
    if (newVariable.name && newVariable.label) {
      setFormData(prev => ({
        ...prev,
        variables: [...prev.variables, newVariable]
      }))
      setNewVariable({
        name: '',
        type: 'text',
        required: true,
        label: ''
      })
    }
  }

  const removeVariable = (index: number) => {
    setFormData(prev => ({
      ...prev,
      variables: prev.variables.filter((_, i) => i !== index)
    }))
  }

  const insertVariable = (variableName: string) => {
    const textarea = document.getElementById('template-content') as HTMLTextAreaElement
    if (textarea) {
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const text = textarea.value
      const before = text.substring(0, start)
      const after = text.substring(end, text.length)
      const newText = before + `{{${variableName}}}` + after
      
      setFormData(prev => ({
        ...prev,
        template_content: newText
      }))
      
      // Restaurar el foco y posición del cursor
      setTimeout(() => {
        textarea.focus()
        textarea.setSelectionRange(start + variableName.length + 4, start + variableName.length + 4)
      }, 0)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {template ? 'Editar Plantilla' : 'Nueva Plantilla de Documento'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre de la Plantilla</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Ej: Contrato de Servicios Legales"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="document_type">Tipo de Documento</Label>
              <Select
                value={formData.document_type}
                onValueChange={(value) => setFormData(prev => ({ ...prev, document_type: value as any }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="contract">📄 Contrato</SelectItem>
                  <SelectItem value="communication">📧 Comunicación</SelectItem>
                  <SelectItem value="procedural">⚖️ Procesal</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Categoría</Label>
              <Input
                id="category"
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                placeholder="Ej: servicios, requerimiento, demanda"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="practice_area">Área de Práctica</Label>
              <Input
                id="practice_area"
                value={formData.practice_area}
                onChange={(e) => setFormData(prev => ({ ...prev, practice_area: e.target.value }))}
                placeholder="Ej: civil, penal, mercantil"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Descripción breve de la plantilla..."
              rows={2}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="ai_enhanced"
              checked={formData.is_ai_enhanced}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_ai_enhanced: checked }))}
            />
            <Label htmlFor="ai_enhanced" className="flex items-center gap-2">
              <Bot className="h-4 w-4" />
              Mejorar con IA
            </Label>
          </div>

          {/* Variables */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Variables de la Plantilla</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Lista de variables existentes */}
              {formData.variables.length > 0 && (
                <div className="space-y-2">
                  <Label>Variables Definidas:</Label>
                  <div className="flex flex-wrap gap-2">
                    {formData.variables.map((variable, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="cursor-pointer hover:bg-secondary/80 gap-2"
                        onClick={() => insertVariable(variable.name)}
                      >
                        {variable.label} ({variable.name})
                        <X
                          className="h-3 w-3 cursor-pointer hover:text-destructive"
                          onClick={(e) => {
                            e.stopPropagation()
                            removeVariable(index)
                          }}
                        />
                      </Badge>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Haz clic en una variable para insertarla en el contenido
                  </p>
                </div>
              )}

              {/* Formulario para nueva variable */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <Input
                  placeholder="Nombre (ej: nombre_cliente)"
                  value={newVariable.name}
                  onChange={(e) => setNewVariable(prev => ({ ...prev, name: e.target.value.replace(/\s+/g, '_').toLowerCase() }))}
                />
                <Input
                  placeholder="Etiqueta (ej: Nombre del Cliente)"
                  value={newVariable.label}
                  onChange={(e) => setNewVariable(prev => ({ ...prev, label: e.target.value }))}
                />
                <Select
                  value={newVariable.type}
                  onValueChange={(value) => setNewVariable(prev => ({ ...prev, type: value as any }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">Texto</SelectItem>
                    <SelectItem value="number">Número</SelectItem>
                    <SelectItem value="date">Fecha</SelectItem>
                    <SelectItem value="boolean">Sí/No</SelectItem>
                  </SelectContent>
                </Select>
                <Button type="button" onClick={addVariable} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Contenido de la plantilla */}
          <div className="space-y-2">
            <Label htmlFor="template-content">Contenido de la Plantilla</Label>
            <Textarea
              id="template-content"
              value={formData.template_content}
              onChange={(e) => setFormData(prev => ({ ...prev, template_content: e.target.value }))}
              placeholder="Escribe el contenido de tu plantilla aquí. Usa {{nombre_variable}} para insertar variables..."
              rows={12}
              className="font-mono text-sm"
              required
            />
            <p className="text-xs text-muted-foreground">
              Usa la sintaxis {`{{nombre_variable}}`} para insertar variables en el texto
            </p>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={createTemplate.isPending || updateTemplate.isPending}>
              {(createTemplate.isPending || updateTemplate.isPending) ? (template ? 'Actualizando...' : 'Creando...') : (template ? 'Actualizar' : 'Crear Plantilla')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}