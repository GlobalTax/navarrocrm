import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, Edit, MoreHorizontal, CheckCircle, Clock, AlertTriangle, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu'
import { StandardPageContainer } from '@/components/layout/StandardPageContainer'
import { supabase } from '@/integrations/supabase/client'
import { useApp } from '@/contexts/AppContext'
import { TaskWithRelations, STATUS_COLORS, STATUS_LABELS, PRIORITY_COLORS, PRIORITY_LABELS } from '@/hooks/tasks/types'
import { Skeleton } from '@/components/ui/skeleton'
import { useState } from 'react'
import { useTasks } from '@/hooks/useTasks'

export default function TaskDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useApp()
  const { updateTask, deleteTask, isUpdating, isDeleting } = useTasks()
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  // Fetch task data
  const { data: task, isLoading: taskLoading, error: taskError, refetch } = useQuery({
    queryKey: ['task', id],
    queryFn: async (): Promise<TaskWithRelations> => {
      if (!id || !user?.org_id) throw new Error('Missing ID or org_id')
      
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          task_assignments (
            id,
            user_id,
            user:users (
              email,
              role
            )
          ),
          case:cases (
            id,
            title
          ),
          contact:contacts (
            id,
            name
          ),
          created_by_user:users!tasks_created_by_fkey (
            email
          )
        `)
        .eq('id', id)
        .eq('org_id', user.org_id)
        .maybeSingle()

      if (error) throw error
      return data as any
    },
    enabled: !!id && !!user?.org_id,
  })

  const handleEdit = () => {
    setIsEditDialogOpen(true)
  }

  const handleComplete = () => {
    if (!task?.id) return
    updateTask({
      id: task.id,
      status: 'completed',
      completed_at: new Date().toISOString()
    })
  }

  const handleStart = () => {
    if (!task?.id) return
    updateTask({
      id: task.id,
      status: 'in_progress',
      start_date: new Date().toISOString()
    })
  }

  const handleDelete = () => {
    if (!task?.id) return
    if (window.confirm('¿Estás seguro de que quieres eliminar esta tarea? Esta acción no se puede deshacer.')) {
      deleteTask(task.id)
      navigate('/tasks')
    }
  }

  if (taskLoading) {
    return (
      <StandardPageContainer>
        <div className="space-y-6">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </StandardPageContainer>
    )
  }

  if (taskError || !task) {
    return (
      <StandardPageContainer>
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Tarea no encontrada</h2>
          <p className="text-gray-600 mb-4">La tarea que buscas no existe o no tienes permisos para verla.</p>
          <Button onClick={() => navigate('/tasks')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a Tareas
          </Button>
        </div>
      </StandardPageContainer>
    )
  }

  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'completed'

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/tasks')}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Tareas
              </Button>
              <div className="h-6 w-px bg-gray-300" />
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold text-gray-900">{task.title}</h1>
                  <Badge variant="outline" className={STATUS_COLORS[task.status]}>
                    {STATUS_LABELS[task.status]}
                  </Badge>
                  <Badge variant="outline" className={PRIORITY_COLORS[task.priority]}>
                    {PRIORITY_LABELS[task.priority]}
                  </Badge>
                  {isOverdue && (
                    <Badge variant="destructive">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      Vencida
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  Creada el {new Date(task.created_at).toLocaleDateString('es-ES')}
                  {task.due_date && ` • Vence el ${new Date(task.due_date).toLocaleDateString('es-ES')}`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {task.status === 'pending' && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleStart}
                  disabled={isUpdating}
                >
                  <Clock className="h-4 w-4 mr-2" />
                  Iniciar
                </Button>
              )}
              
              {task.status !== 'completed' && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleComplete}
                  disabled={isUpdating}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Completar
                </Button>
              )}

              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleEdit}
                disabled={isUpdating}
              >
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <User className="h-4 w-4 mr-2" />
                    Reasignar
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    className="text-red-600"
                    onClick={handleDelete}
                    disabled={isDeleting}
                  >
                    Eliminar Tarea
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <StandardPageContainer>
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-5 lg:w-[600px]">
              <TabsTrigger value="overview">Resumen</TabsTrigger>
              <TabsTrigger value="subtasks">Subtareas</TabsTrigger>
              <TabsTrigger value="comments">Comentarios</TabsTrigger>
              <TabsTrigger value="time">Tiempo</TabsTrigger>
              <TabsTrigger value="history">Historial</TabsTrigger>
            </TabsList>
            
            <div className="mt-6">
              <TabsContent value="overview" className="space-y-6">
                {/* Información básica de la tarea */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2">
                    <div className="bg-white p-6 rounded-lg border shadow-sm">
                      <h3 className="text-lg font-semibold mb-4">Información de la Tarea</h3>
                      <div className="space-y-4">
                        <div>
                          <span className="font-medium text-gray-700">Título:</span>
                          <span className="ml-2">{task.title}</span>
                        </div>
                        {task.description && (
                          <div>
                            <span className="font-medium text-gray-700">Descripción:</span>
                            <p className="mt-1 text-gray-600">{task.description}</p>
                          </div>
                        )}
                        <div>
                          <span className="font-medium text-gray-700">Estado:</span>
                          <Badge variant="outline" className={`ml-2 ${STATUS_COLORS[task.status]}`}>
                            {STATUS_LABELS[task.status]}
                          </Badge>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Prioridad:</span>
                          <Badge variant="outline" className={`ml-2 ${PRIORITY_COLORS[task.priority]}`}>
                            {PRIORITY_LABELS[task.priority]}
                          </Badge>
                        </div>
                        {task.estimated_hours && (
                          <div>
                            <span className="font-medium text-gray-700">Horas estimadas:</span>
                            <span className="ml-2">{task.estimated_hours}h</span>
                          </div>
                        )}
                        {task.due_date && (
                          <div>
                            <span className="font-medium text-gray-700">Fecha límite:</span>
                            <span className="ml-2">{new Date(task.due_date).toLocaleDateString('es-ES')}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    {/* Asignaciones */}
                    <div className="bg-white p-6 rounded-lg border shadow-sm">
                      <h3 className="text-lg font-semibold mb-4">Asignaciones</h3>
                      {task.task_assignments && task.task_assignments.length > 0 ? (
                        <div className="space-y-2">
                          {task.task_assignments.map((assignment) => (
                            <div key={assignment.id} className="flex items-center gap-2">
                              <User className="h-4 w-4 text-gray-400" />
                              <span className="text-sm">{assignment.user?.email}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-gray-500">Sin asignaciones</div>
                      )}
                    </div>

                    {/* Caso relacionado */}
                    {task.case && (
                      <div className="bg-white p-6 rounded-lg border shadow-sm">
                        <h3 className="text-lg font-semibold mb-4">Expediente</h3>
                        <div className="text-sm">
                          <Button 
                            variant="link" 
                            className="p-0 h-auto text-left"
                            onClick={() => navigate(`/cases/${task.case_id}`)}
                          >
                            {task.case.title}
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Cliente relacionado */}
                    {task.contact && (
                      <div className="bg-white p-6 rounded-lg border shadow-sm">
                        <h3 className="text-lg font-semibold mb-4">Cliente</h3>
                        <div className="text-sm">
                          <Button 
                            variant="link" 
                            className="p-0 h-auto text-left"
                            onClick={() => navigate(`/contacts/${task.contact_id}`)}
                          >
                            {task.contact.name}
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="subtasks">
                <div className="bg-white p-12 rounded-lg border shadow-sm text-center">
                  <div className="text-lg font-medium mb-2">Subtareas</div>
                  <p className="text-sm text-gray-600">Esta funcionalidad estará disponible próximamente</p>
                </div>
              </TabsContent>
              
              <TabsContent value="comments">
                <div className="bg-white p-12 rounded-lg border shadow-sm text-center">
                  <div className="text-lg font-medium mb-2">Comentarios</div>
                  <p className="text-sm text-gray-600">Esta funcionalidad estará disponible próximamente</p>
                </div>
              </TabsContent>
              
              <TabsContent value="time">
                <div className="bg-white p-12 rounded-lg border shadow-sm text-center">
                  <div className="text-lg font-medium mb-2">Registro de Tiempo</div>
                  <p className="text-sm text-gray-600">Esta funcionalidad estará disponible próximamente</p>
                </div>
              </TabsContent>

              <TabsContent value="history">
                <div className="bg-white p-12 rounded-lg border shadow-sm text-center">
                  <div className="text-lg font-medium mb-2">Historial de Cambios</div>
                  <p className="text-sm text-gray-600">Esta funcionalidad estará disponible próximamente</p>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </StandardPageContainer>
      </div>
    </div>
  )
}