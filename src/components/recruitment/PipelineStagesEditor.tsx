import { useState } from 'react'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import { StandardCard, StandardCardContent, StandardCardHeader, StandardCardTitle } from '@/components/ui/standard-card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Plus, Edit, Trash2, GripVertical, Palette } from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

interface PipelineStage {
  id: string
  name: string
  description?: string
  color: string
  icon: string
  sort_order: number
  is_active: boolean
  is_default: boolean
}

interface StageFormData {
  name: string
  description: string
  color: string
  icon: string
}

const defaultColors = [
  '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', 
  '#3b82f6', '#22c55e', '#ef4444', '#6366f1'
]

const defaultIcons = [
  'user-plus', 'search', 'code', 'users', 
  'mail', 'check-circle', 'x-circle', 'star'
]

export function PipelineStagesEditor() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingStage, setEditingStage] = useState<PipelineStage | null>(null)
  const [formData, setFormData] = useState<StageFormData>({
    name: '',
    description: '',
    color: '#6366f1',
    icon: 'users'
  })

  const queryClient = useQueryClient()

  const { data: stages = [], isLoading } = useQuery({
    queryKey: ['recruitment-pipeline-stages'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('recruitment_pipeline_stages')
        .select('*')
        .eq('is_active', true)
        .order('sort_order')

      if (error) throw error
      return data as PipelineStage[]
    }
  })

  const createStageMutation = useMutation({
    mutationFn: async (stageData: StageFormData) => {
      const { data: { user } } = await supabase.auth.getUser()
      const { data: userData } = await supabase.from('users').select('org_id').eq('id', user?.id).single()
      
      const maxOrder = Math.max(...stages.map(s => s.sort_order), 0)
      
      const { error } = await supabase
        .from('recruitment_pipeline_stages')
        .insert({
          ...stageData,
          org_id: userData?.org_id,
          sort_order: maxOrder + 1
        })

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recruitment-pipeline-stages'] })
      toast.success('Etapa creada correctamente')
      resetForm()
    },
    onError: () => {
      toast.error('Error al crear la etapa')
    }
  })

  const updateStageMutation = useMutation({
    mutationFn: async ({ id, ...stageData }: StageFormData & { id: string }) => {
      const { error } = await supabase
        .from('recruitment_pipeline_stages')
        .update(stageData)
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recruitment-pipeline-stages'] })
      toast.success('Etapa actualizada correctamente')
      resetForm()
    },
    onError: () => {
      toast.error('Error al actualizar la etapa')
    }
  })

  const deleteStageMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('recruitment_pipeline_stages')
        .update({ is_active: false })
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recruitment-pipeline-stages'] })
      toast.success('Etapa eliminada correctamente')
    },
    onError: () => {
      toast.error('Error al eliminar la etapa')
    }
  })

  const reorderMutation = useMutation({
    mutationFn: async (reorderedStages: PipelineStage[]) => {
      const updates = reorderedStages.map((stage, index) => ({
        id: stage.id,
        sort_order: index + 1
      }))

      for (const update of updates) {
        const { error } = await supabase
          .from('recruitment_pipeline_stages')
          .update({ sort_order: update.sort_order })
          .eq('id', update.id)

        if (error) throw error
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recruitment-pipeline-stages'] })
      toast.success('Orden de etapas actualizado')
    },
    onError: () => {
      toast.error('Error al reordenar las etapas')
    }
  })

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      color: '#6366f1',
      icon: 'users'
    })
    setEditingStage(null)
    setIsDialogOpen(false)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (editingStage) {
      updateStageMutation.mutate({ ...formData, id: editingStage.id })
    } else {
      createStageMutation.mutate(formData)
    }
  }

  const handleEdit = (stage: PipelineStage) => {
    setEditingStage(stage)
    setFormData({
      name: stage.name,
      description: stage.description || '',
      color: stage.color,
      icon: stage.icon
    })
    setIsDialogOpen(true)
  }

  const handleDragEnd = (result: any) => {
    if (!result.destination) return

    const reorderedStages = Array.from(stages)
    const [removed] = reorderedStages.splice(result.source.index, 1)
    reorderedStages.splice(result.destination.index, 0, removed)

    reorderMutation.mutate(reorderedStages)
  }

  if (isLoading) {
    return <div className="flex justify-center p-8">Cargando etapas...</div>
  }

  return (
    <StandardCard>
      <StandardCardHeader>
        <div className="flex items-center justify-between">
          <StandardCardTitle>Configurar Etapas del Pipeline</StandardCardTitle>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setEditingStage(null)}>
                <Plus className="h-4 w-4 mr-2" />
                Nueva Etapa
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingStage ? 'Editar Etapa' : 'Nueva Etapa'}
                </DialogTitle>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Nombre</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="description">Descripción</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={2}
                  />
                </div>
                
                <div>
                  <Label>Color</Label>
                  <div className="flex gap-2 mt-2">
                    {defaultColors.map(color => (
                      <button
                        key={color}
                        type="button"
                        className={`w-8 h-8 rounded-full border-2 ${
                          formData.color === color ? 'border-gray-900' : 'border-gray-300'
                        }`}
                        style={{ backgroundColor: color }}
                        onClick={() => setFormData(prev => ({ ...prev, color }))}
                      />
                    ))}
                  </div>
                </div>
                
                <div>
                  <Label>Icono</Label>
                  <div className="grid grid-cols-4 gap-2 mt-2">
                    {defaultIcons.map(icon => (
                      <button
                        key={icon}
                        type="button"
                        className={`p-2 rounded border ${
                          formData.icon === icon ? 'border-primary bg-primary/10' : 'border-gray-300'
                        }`}
                        onClick={() => setFormData(prev => ({ ...prev, icon }))}
                      >
                        <div className="w-4 h-4 mx-auto" />
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="flex gap-2 pt-4">
                  <Button type="submit" className="flex-1">
                    {editingStage ? 'Actualizar' : 'Crear'}
                  </Button>
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancelar
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </StandardCardHeader>
      
      <StandardCardContent>
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="stages">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                {stages.map((stage, index) => (
                  <Draggable key={stage.id} draggableId={stage.id} index={index}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border"
                      >
                        <div {...provided.dragHandleProps}>
                          <GripVertical className="h-4 w-4 text-gray-400" />
                        </div>
                        
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: stage.color }}
                        />
                        
                        <div className="flex-1">
                          <div className="font-medium">{stage.name}</div>
                          {stage.description && (
                            <div className="text-sm text-gray-600">{stage.description}</div>
                          )}
                        </div>
                        
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEdit(stage)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          
                          {!stage.is_default && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => deleteStageMutation.mutate(stage.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </StandardCardContent>
    </StandardCard>
  )
}