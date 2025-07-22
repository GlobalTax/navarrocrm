import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { DocumentTemplate } from '@/hooks/useDocumentTemplates'
import { FileText, Bot, Copy, Settings, X } from 'lucide-react'

interface TemplatePreviewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  template: DocumentTemplate | null
  onGenerate: (templateId: string) => void
  onEdit: (templateId: string) => void
  onDuplicate: (templateId: string) => void
}

export const TemplatePreviewDialog = ({
  open,
  onOpenChange,
  template,
  onGenerate,
  onEdit,
  onDuplicate
}: TemplatePreviewDialogProps) => {
  const [previewContent, setPreviewContent] = useState('')

  useEffect(() => {
    if (template) {
      // Generar preview reemplazando variables con valores de ejemplo
      let content = template.template_content
      template.variables.forEach(variable => {
        const placeholder = getVariablePlaceholder(variable)
        content = content.replace(
          new RegExp(`{{${variable.name}}}`, 'g'),
          `[${placeholder}]`
        )
      })
      setPreviewContent(content)
    }
  }, [template])

  const getVariablePlaceholder = (variable: any) => {
    switch (variable.type) {
      case 'text':
        return `Texto: ${variable.label}`
      case 'number':
        return `Número: ${variable.label}`
      case 'date':
        return `Fecha: ${variable.label}`
      case 'boolean':
        return `Sí/No: ${variable.label}`
      case 'select':
        return `Opción: ${variable.label}`
      default:
        return variable.label
    }
  }

  const getDocumentTypeLabel = (type: string) => {
    switch (type) {
      case 'contract':
        return 'Contrato'
      case 'communication':
        return 'Comunicación'
      case 'procedural':
        return 'Procesal'
      default:
        return type
    }
  }

  const getDocumentTypeColor = (type: string) => {
    switch (type) {
      case 'contract':
        return 'bg-primary/10 text-primary border-primary/20'
      case 'communication':
        return 'bg-blue-50 text-blue-700 border-blue-200'
      case 'procedural':
        return 'bg-purple-50 text-purple-700 border-purple-200'
      default:
        return 'bg-muted text-muted-foreground border-muted'
    }
  }

  if (!template) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <DialogTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                {template.name}
                {template.is_ai_enhanced && (
                  <Bot className="h-4 w-4 text-primary" />
                )}
              </DialogTitle>
              
              <div className="flex items-center gap-2">
                <Badge className={getDocumentTypeColor(template.document_type)}>
                  {getDocumentTypeLabel(template.document_type)}
                </Badge>
                {template.category && (
                  <Badge variant="outline">
                    {template.category}
                  </Badge>
                )}
                {template.practice_area && (
                  <Badge variant="secondary">
                    {template.practice_area}
                  </Badge>
                )}
              </div>
              
              {template.description && (
                <p className="text-sm text-muted-foreground">
                  {template.description}
                </p>
              )}
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  onDuplicate(template.id)
                  onOpenChange(false)
                }}
                className="gap-2"
              >
                <Copy className="h-4 w-4" />
                Duplicar
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  onEdit(template.id)
                  onOpenChange(false)
                }}
                className="gap-2"
              >
                <Settings className="h-4 w-4" />
                Editar
              </Button>
              <Button
                onClick={() => {
                  onGenerate(template.id)
                  onOpenChange(false)
                }}
                className="gap-2"
              >
                <FileText className="h-4 w-4" />
                Generar Documento
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 flex gap-6 min-h-0">
          {/* Panel de variables */}
          <div className="w-1/3 space-y-4">
            <div>
              <h3 className="font-medium text-foreground mb-3">
                Variables ({template.variables.length})
              </h3>
              <ScrollArea className="h-[calc(100%-2rem)]">
                <div className="space-y-3">
                  {template.variables.map((variable, index) => (
                    <div
                      key={index}
                      className="p-3 border rounded-lg bg-card"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-sm">
                          {variable.label}
                        </span>
                        {variable.required && (
                          <Badge variant="destructive" className="text-xs">
                            Requerido
                          </Badge>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground space-y-1">
                        <p>Tipo: {variable.type}</p>
                        <p>Variable: {`{{${variable.name}}}`}</p>
                        {variable.default && (
                          <p>Por defecto: {variable.default}</p>
                        )}
                        {variable.options && variable.options.length > 0 && (
                          <p>Opciones: {variable.options.join(', ')}</p>
                        )}
                      </div>
                    </div>
                  ))}
                  {template.variables.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No hay variables definidas
                    </p>
                  )}
                </div>
              </ScrollArea>
            </div>
          </div>

          <Separator orientation="vertical" />

          {/* Preview del contenido */}
          <div className="flex-1 space-y-4">
            <h3 className="font-medium text-foreground">
              Vista Previa del Documento
            </h3>
            <ScrollArea className="h-[calc(100%-2rem)]">
              <div className="prose prose-sm max-w-none">
                <div className="bg-card border rounded-lg p-6">
                  <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
                    {previewContent}
                  </pre>
                </div>
              </div>
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}