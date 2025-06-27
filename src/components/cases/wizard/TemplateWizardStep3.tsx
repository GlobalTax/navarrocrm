
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { AdvancedTemplateData, TemplateStage } from '@/types/templateTypes'
import { Plus, Trash2, Clock, AlertTriangle, GripVertical } from 'lucide-react'
import { useState } from 'react'

interface TemplateWizardStep3Props {
  formData: {
    template_data: AdvancedTemplateData
  }
  updateTemplateData: (updates: Partial<AdvancedTemplateData>) => void
  errors: Record<string, string>
}

const REQUIRED_DOCUMENTS_OPTIONS = [
  'DNI/NIF del cliente',
  'Poder notarial',
  'Documentación societaria',
  'Contratos relacionados',
  'Documentos de registro',
  'Certificados oficiales',
  'Informes periciales',
  'Documentación contable',
  'Escrituras públicas',
  'Resoluciones administrativas'
]

const ASSIGNEE_ROLES = [
  'Partner',
  'Senior',
  'Junior',
  'Paralegal',
  'Administrativo'
]

export function TemplateWizardStep3({ formData, updateTemplateData, errors }: TemplateWizardStep3Props) {
  const [newStage, setNewStage] = useState<Partial<TemplateStage>>({
    name: '',
    description: '',
    estimated_days: 7,
    required_documents: [],
    is_critical: false
  })

  const stages = formData.template_data.stages

  const handleAddStage = () => {
    if (newStage.name?.trim()) {
      const stage: TemplateStage = {
        id: Date.now().toString(),
        name: newStage.name,
        description: newStage.description || '',
        order: stages.length + 1,
        estimated_days: newStage.estimated_days || 7,
        required_documents: newStage.required_documents || [],
        default_assignee_role: newStage.default_assignee_role,
        is_critical: newStage.is_critical || false
      }

      updateTemplateData({
        stages: [...stages, stage]
      })

      setNewStage({
        name: '',
        description: '',
        estimated_days: 7,
        required_documents: [],
        is_critical: false
      })
    }
  }

  const handleRemoveStage = (stageId: string) => {
    updateTemplateData({
      stages: stages.filter(stage => stage.id !== stageId)
    })
  }

  const handleUpdateStage = (stageId: string, updates: Partial<TemplateStage>) => {
    updateTemplateData({
      stages: stages.map(stage => 
        stage.id === stageId ? { ...stage, ...updates } : stage
      )
    })
  }

  const handleDocumentToggle = (stageId: string, document: string, checked: boolean) => {
    const stage = stages.find(s => s.id === stageId)
    if (!stage) return

    const updatedDocuments = checked
      ? [...stage.required_documents, document]
      : stage.required_documents.filter(doc => doc !== document)

    handleUpdateStage(stageId, { required_documents: updatedDocuments })
  }

  const totalDays = stages.reduce((sum, stage) => sum + stage.estimated_days, 0)

  return (
    <div className="space-y-6">
      {errors.stages && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700">{errors.stages}</p>
        </div>
      )}

      {/* Etapas existentes */}
      <div className="space-y-4">
        {stages.map((stage, index) => (
          <Card key={stage.id} className={stage.is_critical ? 'border-orange-300 bg-orange-50' : ''}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <GripVertical className="h-4 w-4 text-gray-400" />
                    <Badge variant="outline">Etapa {index + 1}</Badge>
                    {stage.is_critical && (
                      <Badge className="bg-orange-100 text-orange-800">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Crítica
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-lg">{stage.name}</CardTitle>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveStage(stage.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nombre de la Etapa</Label>
                  <Input
                    value={stage.name}
                    onChange={(e) => handleUpdateStage(stage.id, { name: e.target.value })}
                    placeholder="Ej: Análisis inicial, Negociación..."
                  />
                </div>
                <div className="space-y-2">
                  <Label>Duración Estimada (días)</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      value={stage.estimated_days}
                      onChange={(e) => handleUpdateStage(stage.id, { estimated_days: parseInt(e.target.value) || 0 })}
                      min="1"
                    />
                    <Clock className="h-4 w-4 text-gray-400" />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Descripción</Label>
                <Textarea
                  value={stage.description}
                  onChange={(e) => handleUpdateStage(stage.id, { description: e.target.value })}
                  placeholder="Describe qué se hace en esta etapa..."
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Responsable por Defecto</Label>
                  <select
                    value={stage.default_assignee_role || ''}
                    onChange={(e) => handleUpdateStage(stage.id, { default_assignee_role: e.target.value || undefined })}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="">Sin asignar</option>
                    {ASSIGNEE_ROLES.map(role => (
                      <option key={role} value={role}>{role}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center space-x-2 pt-7">
                  <Checkbox
                    id={`critical-${stage.id}`}
                    checked={stage.is_critical}
                    onCheckedChange={(checked) => handleUpdateStage(stage.id, { is_critical: !!checked })}
                  />
                  <Label htmlFor={`critical-${stage.id}`}>Etapa crítica</Label>
                </div>
              </div>

              <div className="space-y-3">
                <Label>Documentos Requeridos</Label>
                <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                  {REQUIRED_DOCUMENTS_OPTIONS.map(doc => (
                    <label key={doc} className="flex items-center space-x-2 text-sm">
                      <Checkbox
                        checked={stage.required_documents.includes(doc)}
                        onCheckedChange={(checked) => handleDocumentToggle(stage.id, doc, !!checked)}
                      />
                      <span>{doc}</span>
                    </label>
                  ))}
                </div>
                {stage.required_documents.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {stage.required_documents.map(doc => (
                      <Badge key={doc} variant="secondary" className="text-xs">{doc}</Badge>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Añadir nueva etapa */}
      <Card className="border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Añadir Nueva Etapa
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nombre *</Label>
              <Input
                value={newStage.name || ''}
                onChange={(e) => setNewStage({ ...newStage, name: e.target.value })}
                placeholder="Ej: Investigación previa"
              />
            </div>
            <div className="space-y-2">
              <Label>Duración (días)</Label>
              <Input
                type="number"
                value={newStage.estimated_days || 7}
                onChange={(e) => setNewStage({ ...newStage, estimated_days: parseInt(e.target.value) || 7 })}
                min="1"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Descripción</Label>
            <Textarea
              value={newStage.description || ''}
              onChange={(e) => setNewStage({ ...newStage, description: e.target.value })}
              placeholder="¿Qué se hace en esta etapa?"
              rows={2}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="new-critical"
                checked={newStage.is_critical || false}
                onCheckedChange={(checked) => setNewStage({ ...newStage, is_critical: !!checked })}
              />
              <Label htmlFor="new-critical">Etapa crítica</Label>
            </div>
            <Button onClick={handleAddStage} disabled={!newStage.name?.trim()}>
              <Plus className="h-4 w-4 mr-2" />
              Añadir Etapa
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Resumen */}
      {stages.length > 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-blue-800">Resumen del Proceso</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600">{stages.length}</div>
                <div className="text-sm text-blue-700">Etapas Totales</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">{totalDays}</div>
                <div className="text-sm text-blue-700">Días Estimados</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600">
                  {stages.filter(s => s.is_critical).length}
                </div>
                <div className="text-sm text-orange-700">Etapas Críticas</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
