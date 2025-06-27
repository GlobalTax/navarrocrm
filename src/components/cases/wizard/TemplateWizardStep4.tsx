
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AdvancedTemplateData, TemplateTask } from '@/types/templateTypes'
import { Plus, Trash2, Clock, Target, Link, CheckSquare } from 'lucide-react'
import { useState } from 'react'

interface TemplateWizardStep4Props {
  formData: {
    template_data: AdvancedTemplateData
  }
  updateTemplateData: (updates: Partial<AdvancedTemplateData>) => void
  errors: Record<string, string>
}

const TASK_PRIORITIES = [
  { id: 'low', name: 'Baja', color: 'bg-gray-100 text-gray-800' },
  { id: 'medium', name: 'Media', color: 'bg-blue-100 text-blue-800' },
  { id: 'high', name: 'Alta', color: 'bg-orange-100 text-orange-800' },
  { id: 'critical', name: 'Crítica', color: 'bg-red-100 text-red-800' }
]

const ASSIGNEE_ROLES = [
  'Partner',
  'Senior',
  'Junior',
  'Paralegal',
  'Administrativo'
]

export function TemplateWizardStep4({ formData, updateTemplateData, errors }: TemplateWizardStep4Props) {
  const [newTask, setNewTask] = useState<Partial<TemplateTask>>({
    name: '',
    description: '',
    estimated_hours: 2,
    priority: 'medium',
    due_days_after_start: 7,
    dependencies: [],
    is_automatic: true
  })

  const tasks = formData.template_data.tasks
  const stages = formData.template_data.stages

  const handleAddTask = () => {
    if (newTask.name?.trim()) {
      const task: TemplateTask = {
        id: Date.now().toString(),
        name: newTask.name,
        description: newTask.description || '',
        stage_id: newTask.stage_id,
        estimated_hours: newTask.estimated_hours || 2,
        priority: newTask.priority as any || 'medium',
        assignee_role: newTask.assignee_role,
        due_days_after_start: newTask.due_days_after_start || 7,
        dependencies: newTask.dependencies || [],
        is_automatic: newTask.is_automatic || true
      }

      updateTemplateData({
        tasks: [...tasks, task]
      })

      setNewTask({
        name: '',
        description: '',
        estimated_hours: 2,
        priority: 'medium',
        due_days_after_start: 7,
        dependencies: [],
        is_automatic: true
      })
    }
  }

  const handleRemoveTask = (taskId: string) => {
    updateTemplateData({
      tasks: tasks.filter(task => task.id !== taskId)
    })
  }

  const handleUpdateTask = (taskId: string, updates: Partial<TemplateTask>) => {
    updateTemplateData({
      tasks: tasks.map(task => 
        task.id === taskId ? { ...task, ...updates } : task
      )
    })
  }

  const handleDependencyToggle = (taskId: string, dependencyId: string, checked: boolean) => {
    const task = tasks.find(t => t.id === taskId)
    if (!task) return

    const updatedDependencies = checked
      ? [...task.dependencies, dependencyId]
      : task.dependencies.filter(dep => dep !== dependencyId)

    handleUpdateTask(taskId, { dependencies: updatedDependencies })
  }

  const totalHours = tasks.reduce((sum, task) => sum + task.estimated_hours, 0)
  const automaticTasks = tasks.filter(task => task.is_automatic).length

  const getPriorityConfig = (priority: string) => {
    return TASK_PRIORITIES.find(p => p.id === priority) || TASK_PRIORITIES[1]
  }

  const getStagesByPriority = () => {
    const stageMap = new Map()
    
    tasks.forEach(task => {
      if (task.stage_id) {
        const stage = stages.find(s => s.id === task.stage_id)
        if (stage) {
          if (!stageMap.has(task.stage_id)) {
            stageMap.set(task.stage_id, { stage, tasks: [] })
          }
          stageMap.get(task.stage_id).tasks.push(task)
        }
      }
    })

    const unassignedTasks = tasks.filter(task => !task.stage_id)
    
    return { stageMap, unassignedTasks }
  }

  const { stageMap, unassignedTasks } = getStagesByPriority()

  return (
    <div className="space-y-6">
      {/* Tareas por etapa */}
      <div className="space-y-4">
        {Array.from(stageMap.entries()).map(([stageId, { stage, tasks: stageTasks }]) => (
          <Card key={stageId}>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <CheckSquare className="h-5 w-5" />
                {stage.name}
                <Badge variant="outline">{stageTasks.length} tareas</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stageTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    allTasks={tasks}
                    onUpdate={handleUpdateTask}
                    onRemove={handleRemoveTask}
                    onDependencyToggle={handleDependencyToggle}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Tareas sin asignar a etapa */}
        {unassignedTasks.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Tareas Generales
                <Badge variant="outline">{unassignedTasks.length} tareas</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {unassignedTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    allTasks={tasks}
                    onUpdate={handleUpdateTask}
                    onRemove={handleRemoveTask}
                    onDependencyToggle={handleDependencyToggle}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Añadir nueva tarea */}
      <Card className="border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Añadir Nueva Tarea
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nombre de la Tarea *</Label>
              <Input
                value={newTask.name || ''}
                onChange={(e) => setNewTask({ ...newTask, name: e.target.value })}
                placeholder="Ej: Revisar documentación inicial"
              />
            </div>
            <div className="space-y-2">
              <Label>Etapa</Label>
              <Select
                value={newTask.stage_id || 'none'}
                onValueChange={(value) => setNewTask({ ...newTask, stage_id: value === 'none' ? undefined : value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar etapa..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Tarea general</SelectItem>
                  {stages.map((stage) => (
                    <SelectItem key={stage.id} value={stage.id}>
                      {stage.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Descripción</Label>
            <Textarea
              value={newTask.description || ''}
              onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
              placeholder="Describe qué hay que hacer..."
              rows={2}
            />
          </div>

          <div className="grid grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Horas Estimadas</Label>
              <Input
                type="number"
                value={newTask.estimated_hours || 2}
                onChange={(e) => setNewTask({ ...newTask, estimated_hours: parseFloat(e.target.value) || 2 })}
                min="0.5"
                step="0.5"
              />
            </div>
            <div className="space-y-2">
              <Label>Prioridad</Label>
              <Select
                value={newTask.priority || 'medium'}
                onValueChange={(value) => setNewTask({ ...newTask, priority: value as any })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TASK_PRIORITIES.map((priority) => (
                    <SelectItem key={priority.id} value={priority.id}>
                      {priority.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Responsable</Label>
              <Select
                value={newTask.assignee_role || 'none'}
                onValueChange={(value) => setNewTask({ ...newTask, assignee_role: value === 'none' ? undefined : value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sin asignar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sin asignar</SelectItem>
                  {ASSIGNEE_ROLES.map((role) => (
                    <SelectItem key={role} value={role}>
                      {role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Vencimiento (días)</Label>
              <Input
                type="number"
                value={newTask.due_days_after_start || 7}
                onChange={(e) => setNewTask({ ...newTask, due_days_after_start: parseInt(e.target.value) || 7 })}
                min="1"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="new-automatic"
                checked={newTask.is_automatic || false}
                onCheckedChange={(checked) => setNewTask({ ...newTask, is_automatic: !!checked })}
              />
              <Label htmlFor="new-automatic">Crear automáticamente</Label>
            </div>
            <Button onClick={handleAddTask} disabled={!newTask.name?.trim()}>
              <Plus className="h-4 w-4 mr-2" />
              Añadir Tarea
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Resumen */}
      {tasks.length > 0 && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="text-green-800">Resumen de Tareas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-green-600">{tasks.length}</div>
                <div className="text-sm text-green-700">Tareas Totales</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">{totalHours}h</div>
                <div className="text-sm text-blue-700">Horas Estimadas</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">{automaticTasks}</div>
                <div className="text-sm text-purple-700">Automáticas</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600">
                  {tasks.filter(t => t.priority === 'critical' || t.priority === 'high').length}
                </div>
                <div className="text-sm text-orange-700">Alta Prioridad</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// Componente TaskCard separado para mantener el código organizado
function TaskCard({ 
  task, 
  allTasks, 
  onUpdate, 
  onRemove, 
  onDependencyToggle 
}: {
  task: TemplateTask
  allTasks: TemplateTask[]
  onUpdate: (taskId: string, updates: Partial<TemplateTask>) => void
  onRemove: (taskId: string) => void
  onDependencyToggle: (taskId: string, dependencyId: string, checked: boolean) => void
}) {
  const [isExpanded, setIsExpanded] = useState(false)
  const priorityConfig = TASK_PRIORITIES.find(p => p.id === task.priority) || TASK_PRIORITIES[1]
  const availableDependencies = allTasks.filter(t => t.id !== task.id)

  return (
    <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1">
          <div className="flex items-center gap-2">
            <Badge className={priorityConfig.color}>
              {priorityConfig.name}
            </Badge>
            {task.is_automatic && (
              <Badge variant="outline" className="bg-blue-50 text-blue-700">
                Auto
              </Badge>
            )}
          </div>
          <div className="flex-1">
            <h4 className="font-medium">{task.name}</h4>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {task.estimated_hours}h
              </span>
              <span>Día {task.due_days_after_start}</span>
              {task.assignee_role && <span>{task.assignee_role}</span>}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? 'Menos' : 'Más'}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onRemove(task.id)}
            className="text-red-500 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {isExpanded && (
        <div className="mt-4 pt-4 border-t space-y-4">
          <div className="space-y-2">
            <Label>Descripción</Label>
            <Textarea
              value={task.description}
              onChange={(e) => onUpdate(task.id, { description: e.target.value })}
              rows={2}
            />
          </div>

          {availableDependencies.length > 0 && (
            <div className="space-y-2">
              <Label>Dependencias</Label>
              <div className="grid grid-cols-2 gap-2 max-h-24 overflow-y-auto">
                {availableDependencies.map(depTask => (
                  <label key={depTask.id} className="flex items-center space-x-2 text-sm">
                    <Checkbox
                      checked={task.dependencies.includes(depTask.id)}
                      onCheckedChange={(checked) => onDependencyToggle(task.id, depTask.id, !!checked)}
                    />
                    <span>{depTask.name}</span>
                  </label>
                ))}
              </div>
              {task.dependencies.length > 0 && (
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <Link className="h-3 w-3" />
                  Depende de {task.dependencies.length} tarea(s)
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
