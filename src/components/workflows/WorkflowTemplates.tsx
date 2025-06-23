
import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Download, FileText, Users, Clock } from 'lucide-react'

interface WorkflowTemplate {
  id: string
  name: string
  description: string
  category: string
  template_data: any
  is_system_template: boolean
}

interface WorkflowTemplatesProps {
  templates?: WorkflowTemplate[]
  onUseTemplate?: (template: WorkflowTemplate) => void
  onClose?: () => void
}

const getCategoryIcon = (category: string) => {
  const icons = {
    client_management: Users,
    legal: FileText,
    task_management: Clock,
    general: FileText
  }
  const Icon = icons[category as keyof typeof icons] || FileText
  return <Icon className="w-4 h-4" />
}

const getCategoryLabel = (category: string) => {
  const labels = {
    client_management: 'Gestión de Clientes',
    legal: 'Legal',
    task_management: 'Gestión de Tareas',
    general: 'General'
  }
  return labels[category as keyof typeof labels] || category
}

export const WorkflowTemplates: React.FC<WorkflowTemplatesProps> = ({
  templates = [],
  onUseTemplate,
  onClose
}) => {
  const groupedTemplates = templates.reduce((acc, template) => {
    if (!acc[template.category]) {
      acc[template.category] = []
    }
    acc[template.category].push(template)
    return acc
  }, {} as Record<string, WorkflowTemplate[]>)

  if (templates.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Plantillas de Workflows</CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <p className="text-gray-500">No hay plantillas disponibles</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {Object.entries(groupedTemplates).map(([category, categoryTemplates]) => (
        <div key={category}>
          <div className="flex items-center gap-2 mb-4">
            {getCategoryIcon(category)}
            <h3 className="text-lg font-semibold">{getCategoryLabel(category)}</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categoryTemplates.map((template) => (
              <Card key={template.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-base">{template.name}</CardTitle>
                    {template.is_system_template && (
                      <Badge variant="secondary" className="text-xs">
                        Sistema
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">{template.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span>{template.template_data?.actions?.length || 0} acciones</span>
                      <span>•</span>
                      <span>{template.template_data?.conditions?.length || 0} condiciones</span>
                    </div>
                    {onUseTemplate && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onUseTemplate(template)}
                      >
                        <Download className="w-4 h-4 mr-1" />
                        Usar
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
