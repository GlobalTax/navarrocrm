import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { 
  Plus, 
  Trash2, 
  Copy, 
  Save, 
  FileText,
  Building,
  Scale,
  Users,
  DollarSign
} from 'lucide-react'
import { PhaseTemplate } from '@/types/phase.types'
import { toast } from 'sonner'

interface PhaseTemplateManagerProps {
  onApplyTemplate: (template: PhaseTemplate) => void
}

export const PhaseTemplateManager: React.FC<PhaseTemplateManagerProps> = ({ onApplyTemplate }) => {
  const [templates, setTemplates] = useState<PhaseTemplate[]>([
    {
      id: '1',
      name: 'Consultoría Legal Estándar',
      description: 'Plantilla para servicios de consultoría legal general',
      practiceArea: 'general',
      phases: [
        {
          name: 'Análisis Inicial',
          description: 'Revisión y análisis de la situación legal actual',
          status: 'pending',
          timeline: {},
          dependencies: [],
          progress: { completionPercentage: 0, completedTasks: 0, totalTasks: 5, milestonesAchieved: 0, totalMilestones: 2 },
          approval: { status: 'pending', requiredApprovers: [] },
          services: [],
          deliverables: ['Informe de análisis inicial', 'Recomendaciones preliminares'],
          paymentPercentage: 30,
          budget: { estimated: 2000 },
          documentIds: [],
          teamMembers: [],
          notifications: [],
          tags: ['análisis', 'inicial'],
          customFields: {}
        },
        {
          name: 'Desarrollo de Estrategia',
          description: 'Elaboración de la estrategia legal a seguir',
          status: 'pending',
          timeline: {},
          dependencies: [],
          progress: { completionPercentage: 0, completedTasks: 0, totalTasks: 8, milestonesAchieved: 0, totalMilestones: 3 },
          approval: { status: 'pending', requiredApprovers: [] },
          services: [],
          deliverables: ['Plan estratégico', 'Timeline de acciones'],
          paymentPercentage: 40,
          budget: { estimated: 3000 },
          documentIds: [],
          teamMembers: [],
          notifications: [],
          tags: ['estrategia', 'planificación'],
          customFields: {}
        },
        {
          name: 'Implementación',
          description: 'Ejecución de las acciones legales planificadas',
          status: 'pending',
          timeline: {},
          dependencies: [],
          progress: { completionPercentage: 0, completedTasks: 0, totalTasks: 12, milestonesAchieved: 0, totalMilestones: 4 },
          approval: { status: 'pending', requiredApprovers: [] },
          services: [],
          deliverables: ['Documentos legales finalizados', 'Seguimiento de procesos'],
          paymentPercentage: 30,
          budget: { estimated: 2500 },
          documentIds: [],
          teamMembers: [],
          notifications: [],
          tags: ['implementación', 'ejecución'],
          customFields: {}
        }
      ],
      isDefault: true,
      orgId: 'org-1',
      createdBy: 'user-1',
      createdAt: new Date().toISOString()
    },
    {
      id: '2',
      name: 'Constitución de Empresa',
      description: 'Proceso completo para constitución de sociedades',
      practiceArea: 'mercantil',
      phases: [
        {
          name: 'Preparación Documentación',
          description: 'Recopilación y preparación de documentos necesarios',
          status: 'pending',
          timeline: {},
          dependencies: [],
          progress: { completionPercentage: 0, completedTasks: 0, totalTasks: 6, milestonesAchieved: 0, totalMilestones: 2 },
          approval: { status: 'pending', requiredApprovers: [] },
          services: [],
          deliverables: ['Documentos preparados', 'Estatutos sociales'],
          paymentPercentage: 40,
          budget: { estimated: 1500 },
          documentIds: [],
          teamMembers: [],
          notifications: [],
          tags: ['documentación', 'preparación'],
          customFields: {}
        },
        {
          name: 'Trámites Registrales',
          description: 'Gestión de inscripciones y registros oficiales',
          status: 'pending',
          timeline: {},
          dependencies: [],
          progress: { completionPercentage: 0, completedTasks: 0, totalTasks: 10, milestonesAchieved: 0, totalMilestones: 3 },
          approval: { status: 'pending', requiredApprovers: [] },
          services: [],
          deliverables: ['Inscripciones registrales', 'Certificados oficiales'],
          paymentPercentage: 60,
          budget: { estimated: 2000 },
          documentIds: [],
          teamMembers: [],
          notifications: [],
          tags: ['registros', 'trámites'],
          customFields: {}
        }
      ],
      isDefault: false,
      orgId: 'org-1',
      createdBy: 'user-1',
      createdAt: new Date().toISOString()
    }
  ])

  const [isCreating, setIsCreating] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<PhaseTemplate | null>(null)

  const getPracticeAreaIcon = (area: string) => {
    switch (area) {
      case 'mercantil': return <Building className="h-4 w-4" />
      case 'civil': return <Users className="h-4 w-4" />
      case 'penal': return <Scale className="h-4 w-4" />
      case 'fiscal': return <DollarSign className="h-4 w-4" />
      default: return <FileText className="h-4 w-4" />
    }
  }

  const handleApplyTemplate = (template: PhaseTemplate) => {
    onApplyTemplate(template)
    toast.success(`Plantilla "${template.name}" aplicada exitosamente`)
  }

  const handleDuplicateTemplate = (template: PhaseTemplate) => {
    const newTemplate: PhaseTemplate = {
      ...template,
      id: crypto.randomUUID(),
      name: `${template.name} (Copia)`,
      isDefault: false,
      createdAt: new Date().toISOString()
    }
    setTemplates(prev => [...prev, newTemplate])
    toast.success('Plantilla duplicada')
  }

  const handleDeleteTemplate = (templateId: string) => {
    setTemplates(prev => prev.filter(t => t.id !== templateId))
    toast.success('Plantilla eliminada')
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Plantillas de Fases</h3>
          <p className="text-sm text-muted-foreground">
            Utiliza plantillas predefinidas para acelerar la creación de proyectos
          </p>
        </div>
        <Dialog open={isCreating} onOpenChange={setIsCreating}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nueva Plantilla
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Crear Nueva Plantilla</DialogTitle>
            </DialogHeader>
            {/* TODO: Implementar formulario de creación de plantillas */}
            <div className="p-4 text-center text-muted-foreground">
              Formulario de creación de plantillas en desarrollo
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map((template) => (
          <Card key={template.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  {getPracticeAreaIcon(template.practiceArea)}
                  <CardTitle className="text-base">{template.name}</CardTitle>
                </div>
                {template.isDefault && (
                  <Badge variant="secondary" className="text-xs">
                    Por defecto
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">{template.description}</p>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Fases:</span>
                  <span className="font-medium">{template.phases.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Área:</span>
                  <Badge variant="outline" className="text-xs">
                    {template.practiceArea}
                  </Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Presupuesto estimado:</span>
                  <span className="font-medium">
                    {template.phases.reduce((sum, phase) => sum + phase.budget.estimated, 0).toLocaleString()} €
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-medium">Fases incluidas:</Label>
                <div className="space-y-1">
                  {template.phases.slice(0, 3).map((phase, index) => (
                    <div key={index} className="text-xs text-muted-foreground">
                      {index + 1}. {phase.name}
                    </div>
                  ))}
                  {template.phases.length > 3 && (
                    <div className="text-xs text-muted-foreground">
                      +{template.phases.length - 3} fases más...
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  className="flex-1"
                  onClick={() => handleApplyTemplate(template)}
                >
                  <FileText className="h-3 w-3 mr-1" />
                  Aplicar
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => handleDuplicateTemplate(template)}
                >
                  <Copy className="h-3 w-3" />
                </Button>
                {!template.isDefault && (
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleDeleteTemplate(template.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {templates.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No hay plantillas disponibles</h3>
            <p className="text-muted-foreground mb-4">
              Crea tu primera plantilla para acelerar la gestión de proyectos
            </p>
            <Button onClick={() => setIsCreating(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Crear Primera Plantilla
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}