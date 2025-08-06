import { useState } from 'react'
import { User, Calendar, Star, GraduationCap, Briefcase, FileText, MessageSquare } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ActivityTimeline } from '@/components/shared/ActivityTimeline'
import { useEmployeeActivities } from '@/hooks/employees/useEmployeeActivities'
import { useEmployeeEvaluations } from '@/hooks/employees/useEmployeeEvaluations'
import { useEmployeeTraining } from '@/hooks/employees/useEmployeeTraining'
import { useEmployeeProjects } from '@/hooks/employees/useEmployeeProjects'
import { useEmployeeNotes } from '@/hooks/employees/useEmployeeNotes'

interface Employee {
  id: string
  employee_number: string
  name: string
  email: string
  phone?: string
  position: string
  department?: string
  hire_date: string
  status: string
  salary?: number
  avatar_url?: string
}

interface EmployeeDataPanelProps {
  employee: Employee | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EmployeeDataPanel({ employee, open, onOpenChange }: EmployeeDataPanelProps) {
  const [activeTab, setActiveTab] = useState('resumen')

  const { data: activities = [], isLoading: activitiesLoading } = useEmployeeActivities(employee?.id || '')
  const { data: evaluations = [], isLoading: evaluationsLoading } = useEmployeeEvaluations(employee?.id || '')
  const { data: training = [], isLoading: trainingLoading } = useEmployeeTraining(employee?.id || '')
  const { data: projects = [], isLoading: projectsLoading } = useEmployeeProjects(employee?.id || '')
  const { data: notes = [], isLoading: notesLoading } = useEmployeeNotes(employee?.id || '')

  if (!employee) return null

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'active': 'bg-success',
      'on_leave': 'bg-warning',
      'inactive': 'bg-destructive',
    }
    return colors[status] || 'bg-muted'
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-3">
            <Avatar className="w-12 h-12">
              <AvatarImage src={employee.avatar_url} />
              <AvatarFallback>
                {employee.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'NN'}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-xl font-bold">
                {employee.name}
              </h2>
              <p className="text-sm text-muted-foreground">
                {employee.position} • {employee.employee_number}
              </p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="resumen" className="flex items-center space-x-2">
              <User className="w-4 h-4" />
              <span>Resumen</span>
            </TabsTrigger>
            <TabsTrigger value="timeline" className="flex items-center space-x-2">
              <Calendar className="w-4 h-4" />
              <span>Timeline</span>
            </TabsTrigger>
            <TabsTrigger value="evaluaciones" className="flex items-center space-x-2">
              <Star className="w-4 h-4" />
              <span>Evaluaciones</span>
            </TabsTrigger>
            <TabsTrigger value="formacion" className="flex items-center space-x-2">
              <GraduationCap className="w-4 h-4" />
              <span>Formación</span>
            </TabsTrigger>
            <TabsTrigger value="proyectos" className="flex items-center space-x-2">
              <Briefcase className="w-4 h-4" />
              <span>Proyectos</span>
            </TabsTrigger>
            <TabsTrigger value="documentos" className="flex items-center space-x-2">
              <FileText className="w-4 h-4" />
              <span>Documentos</span>
            </TabsTrigger>
            <TabsTrigger value="notas" className="flex items-center space-x-2">
              <MessageSquare className="w-4 h-4" />
              <span>Notas</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="resumen" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Información Personal</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Email:</span>
                    <span className="text-sm">{employee.email}</span>
                  </div>
                  {employee.phone && (
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Teléfono:</span>
                      <span className="text-sm">{employee.phone}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Fecha de contratación:</span>
                    <span className="text-sm">{new Date(employee.hire_date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Estado:</span>
                    <Badge className={getStatusColor(employee.status)}>
                      {employee.status}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Información Laboral</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Posición:</span>
                    <span className="text-sm">{employee.position}</span>
                  </div>
                  {employee.department && (
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Departamento:</span>
                      <span className="text-sm">{employee.department}</span>
                    </div>
                  )}
                  {employee.salary && (
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Salario:</span>
                      <span className="text-sm">{employee.salary.toLocaleString()}€</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Estadísticas Rápidas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">{evaluations.length}</div>
                      <div className="text-sm text-muted-foreground">Evaluaciones</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">{training.length}</div>
                      <div className="text-sm text-muted-foreground">Cursos</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">{projects.length}</div>
                      <div className="text-sm text-muted-foreground">Proyectos</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">{activities.length}</div>
                      <div className="text-sm text-muted-foreground">Actividades</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="timeline" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Timeline de Actividades</CardTitle>
              </CardHeader>
              <CardContent>
                <ActivityTimeline activities={activities} isLoading={activitiesLoading} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="evaluaciones" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Evaluaciones de Desempeño</CardTitle>
              </CardHeader>
              <CardContent>
                {evaluationsLoading ? (
                  <div className="space-y-4">
                    {[...Array(2)].map((_, i) => (
                      <div key={i} className="h-20 bg-muted rounded animate-pulse" />
                    ))}
                  </div>
                ) : evaluations.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No hay evaluaciones registradas
                  </p>
                ) : (
                  <div className="space-y-4">
                    {evaluations.map((evaluation) => (
                      <Card key={evaluation.id}>
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-medium">
                              Evaluación {new Date(evaluation.evaluation_period_start).getFullYear()}
                            </h4>
                            <Badge variant={evaluation.status === 'approved' ? 'default' : 'secondary'}>
                              {evaluation.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            Período: {new Date(evaluation.evaluation_period_start).toLocaleDateString()} - {new Date(evaluation.evaluation_period_end).toLocaleDateString()}
                          </p>
                          {evaluation.overall_score && (
                            <div className="flex items-center space-x-2">
                              <span className="text-sm">Puntuación general:</span>
                              <Badge variant="outline">{evaluation.overall_score}/10</Badge>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="formacion" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Formación y Desarrollo</CardTitle>
              </CardHeader>
              <CardContent>
                {trainingLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="h-16 bg-muted rounded animate-pulse" />
                    ))}
                  </div>
                ) : training.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No hay cursos registrados
                  </p>
                ) : (
                  <div className="space-y-4">
                    {training.map((course) => (
                      <Card key={course.id}>
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-medium">{course.course_name}</h4>
                            <Badge variant={course.status === 'completed' ? 'default' : 'secondary'}>
                              {course.status}
                            </Badge>
                          </div>
                          {course.provider && (
                            <p className="text-sm text-muted-foreground mb-1">
                              Proveedor: {course.provider}
                            </p>
                          )}
                          <div className="flex items-center space-x-4 text-sm">
                            {course.completion_date && (
                              <span>Completado: {new Date(course.completion_date).toLocaleDateString()}</span>
                            )}
                            {course.score && (
                              <span>Puntuación: {course.score}</span>
                            )}
                            {course.credits_earned > 0 && (
                              <span>Créditos: {course.credits_earned}</span>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="proyectos" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Proyectos</CardTitle>
              </CardHeader>
              <CardContent>
                {projectsLoading ? (
                  <div className="space-y-4">
                    {[...Array(2)].map((_, i) => (
                      <div key={i} className="h-24 bg-muted rounded animate-pulse" />
                    ))}
                  </div>
                ) : projects.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No hay proyectos registrados
                  </p>
                ) : (
                  <div className="space-y-4">
                    {projects.map((project) => (
                      <Card key={project.id}>
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-medium">{project.project_name}</h4>
                            <Badge variant={project.status === 'completed' ? 'default' : 'secondary'}>
                              {project.status}
                            </Badge>
                          </div>
                          {project.role && (
                            <p className="text-sm text-muted-foreground mb-1">
                              Rol: {project.role}
                            </p>
                          )}
                          {project.description && (
                            <p className="text-sm mb-2">{project.description}</p>
                          )}
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                            {project.start_date && (
                              <span>Inicio: {new Date(project.start_date).toLocaleDateString()}</span>
                            )}
                            {project.end_date && (
                              <span>Fin: {new Date(project.end_date).toLocaleDateString()}</span>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="documentos" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Documentos</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-center text-muted-foreground py-8">
                  Sistema de documentos en desarrollo
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notas" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Notas y Seguimiento</CardTitle>
              </CardHeader>
              <CardContent>
                {notesLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="h-20 bg-muted rounded animate-pulse" />
                    ))}
                  </div>
                ) : notes.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No hay notas registradas
                  </p>
                ) : (
                  <div className="space-y-4">
                    {notes.map((note) => (
                      <Card key={note.id}>
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-medium">{note.title}</h4>
                            <Badge variant="outline">{note.note_type}</Badge>
                          </div>
                          <p className="text-sm mb-2">{note.content}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(note.created_at).toLocaleDateString()}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}