
import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Plus, ListChecks, BarChart3 } from 'lucide-react'
import { useMatterStages, MatterStage, CreateMatterStageData } from '@/hooks/useMatterStages'
import { StageFormDialog } from './StageFormDialog'
import { StageCard } from './StageCard'

interface CaseStagesViewProps {
  caseId: string
  caseTitle: string
}

export const CaseStagesView: React.FC<CaseStagesViewProps> = ({
  caseId,
  caseTitle
}) => {
  const {
    stages,
    isLoading,
    createStage,
    updateStage,
    deleteStage,
    isCreating,
    isUpdating,
    isDeleting
  } = useMatterStages(caseId)

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingStage, setEditingStage] = useState<MatterStage | null>(null)

  const handleCreateStage = (data: CreateMatterStageData) => {
    createStage(data)
  }

  const handleEditStage = (stage: MatterStage) => {
    setEditingStage(stage)
    setIsFormOpen(true)
  }

  const handleUpdateStage = (data: CreateMatterStageData) => {
    if (editingStage) {
      updateStage({
        id: editingStage.id,
        ...data
      })
      setEditingStage(null)
    }
  }

  const handleStatusChange = (stageId: string, status: MatterStage['status']) => {
    updateStage({ id: stageId, status })
  }

  const handleFormClose = () => {
    setIsFormOpen(false)
    setEditingStage(null)
  }

  // Estadísticas
  const totalStages = stages.length
  const completedStages = stages.filter(s => s.status === 'completed').length
  const inProgressStages = stages.filter(s => s.status === 'in_progress').length
  const pendingStages = stages.filter(s => s.status === 'pending').length
  const overdueStages = stages.filter(s => 
    s.due_date && new Date(s.due_date) < new Date() && s.status !== 'completed'
  ).length

  // Agrupar etapas por estado
  const stagesByStatus = {
    pending: stages.filter(s => s.status === 'pending'),
    in_progress: stages.filter(s => s.status === 'in_progress'),
    completed: stages.filter(s => s.status === 'completed')
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Etapas del Expediente</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-gray-100 animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Etapas del Expediente</h3>
          <p className="text-sm text-gray-600">{caseTitle}</p>
        </div>
        <Button onClick={() => setIsFormOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Nueva Etapa
        </Button>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <ListChecks className="h-4 w-4 text-gray-500" />
              <div>
                <div className="text-2xl font-bold">{totalStages}</div>
                <div className="text-xs text-gray-500">Total</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
              <div>
                <div className="text-2xl font-bold">{pendingStages}</div>
                <div className="text-xs text-gray-500">Pendientes</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <div>
                <div className="text-2xl font-bold">{inProgressStages}</div>
                <div className="text-xs text-gray-500">En Progreso</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <div>
                <div className="text-2xl font-bold">{completedStages}</div>
                <div className="text-xs text-gray-500">Completadas</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <div>
                <div className="text-2xl font-bold">{overdueStages}</div>
                <div className="text-xs text-gray-500">Vencidas</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Vista de etapas */}
      <Tabs defaultValue="kanban" className="w-full">
        <TabsList>
          <TabsTrigger value="kanban">Vista Kanban</TabsTrigger>
          <TabsTrigger value="list">Vista Lista</TabsTrigger>
        </TabsList>

        <TabsContent value="kanban" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Columna Pendientes */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                <h4 className="font-medium">Pendientes</h4>
                <Badge variant="secondary">{stagesByStatus.pending.length}</Badge>
              </div>
              <div className="space-y-3">
                {stagesByStatus.pending.map((stage) => (
                  <StageCard
                    key={stage.id}
                    stage={stage}
                    onEdit={handleEditStage}
                    onDelete={deleteStage}
                    onStatusChange={handleStatusChange}
                    isUpdating={isUpdating}
                  />
                ))}
                {stagesByStatus.pending.length === 0 && (
                  <div className="text-center py-8 text-gray-500 text-sm">
                    No hay etapas pendientes
                  </div>
                )}
              </div>
            </div>

            {/* Columna En Progreso */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <h4 className="font-medium">En Progreso</h4>
                <Badge variant="secondary">{stagesByStatus.in_progress.length}</Badge>
              </div>
              <div className="space-y-3">
                {stagesByStatus.in_progress.map((stage) => (
                  <StageCard
                    key={stage.id}
                    stage={stage}
                    onEdit={handleEditStage}
                    onDelete={deleteStage}
                    onStatusChange={handleStatusChange}
                    isUpdating={isUpdating}
                  />
                ))}
                {stagesByStatus.in_progress.length === 0 && (
                  <div className="text-center py-8 text-gray-500 text-sm">
                    No hay etapas en progreso
                  </div>
                )}
              </div>
            </div>

            {/* Columna Completadas */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <h4 className="font-medium">Completadas</h4>
                <Badge variant="secondary">{stagesByStatus.completed.length}</Badge>
              </div>
              <div className="space-y-3">
                {stagesByStatus.completed.map((stage) => (
                  <StageCard
                    key={stage.id}
                    stage={stage}
                    onEdit={handleEditStage}
                    onDelete={deleteStage}
                    onStatusChange={handleStatusChange}
                    isUpdating={isUpdating}
                  />
                ))}
                {stagesByStatus.completed.length === 0 && (
                  <div className="text-center py-8 text-gray-500 text-sm">
                    No hay etapas completadas
                  </div>
                )}
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="list" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stages.map((stage) => (
              <StageCard
                key={stage.id}
                stage={stage}
                onEdit={handleEditStage}
                onDelete={deleteStage}
                onStatusChange={handleStatusChange}
                isUpdating={isUpdating}
              />
            ))}
          </div>
          {stages.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <ListChecks className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">No hay etapas creadas</h3>
              <p className="text-sm mb-4">Crea la primera etapa para comenzar a organizar el trabajo de este expediente.</p>
              <Button onClick={() => setIsFormOpen(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Crear Primera Etapa
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Dialog para crear/editar etapa */}
      <StageFormDialog
        open={isFormOpen}
        onOpenChange={handleFormClose}
        onSubmit={editingStage ? handleUpdateStage : handleCreateStage}
        isLoading={isCreating || isUpdating}
        caseId={caseId}
        stage={editingStage}
        title={editingStage ? 'Editar Etapa' : 'Nueva Etapa'}
      />
    </div>
  )
}
