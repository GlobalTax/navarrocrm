
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Edit, Archive, MoreHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu'
import { StandardPageContainer } from '@/components/layout/StandardPageContainer'
import { CaseStatsPanel } from '@/components/cases/stats/CaseStatsPanel'
import { CaseTimeline } from '@/components/cases/timeline/CaseTimeline'
import { CaseTasksPanel } from '@/components/cases/tasks/CaseTasksPanel'
import { useCases } from '@/hooks/useCases'
import { MatterFormDialog } from '@/components/cases/MatterFormDialog'
import { useState } from 'react'

const getStatusColor = (status: string) => {
  switch (status) {
    case 'open':
      return 'bg-blue-100 text-blue-800'
    case 'on_hold':
      return 'bg-yellow-100 text-yellow-800'
    case 'closed':
      return 'bg-green-100 text-green-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'open':
      return 'Abierto'
    case 'on_hold':
      return 'En Espera'
    case 'closed':
      return 'Cerrado'
    default:
      return status
  }
}

export default function CaseDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { cases, isLoading, updateCase, deleteCase, archiveCase, isUpdating, isDeleting, isArchiving } = useCases()
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando expediente...</p>
        </div>
      </div>
    )
  }

  const case_ = cases.find(c => c.id === id)

  if (!case_) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Expediente no encontrado</h1>
          <p className="text-gray-600 mb-4">El expediente que buscas no existe o no tienes permisos para verlo.</p>
          <Button onClick={() => navigate('/cases')} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a Expedientes
          </Button>
        </div>
      </div>
    )
  }

  const handleEdit = () => {
    setIsEditDialogOpen(true)
  }

  const handleEditSubmit = (formData: any) => {
    if (!case_?.id) return
    updateCase({ id: case_.id, ...formData })
    setIsEditDialogOpen(false)
  }

  const handleArchive = () => {
    if (!case_?.id) return
    archiveCase(case_.id)
  }

  const handleDelete = () => {
    if (!case_?.id) return
    if (window.confirm('¿Estás seguro de que quieres eliminar este expediente? Esta acción no se puede deshacer.')) {
      deleteCase(case_.id)
      navigate('/cases')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/cases')}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Expedientes
              </Button>
              <div className="h-6 w-px bg-gray-300" />
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold text-gray-900">{case_.title}</h1>
                  <Badge variant="outline" className={getStatusColor(case_.status)}>
                    {getStatusLabel(case_.status)}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  Creado el {new Date(case_.created_at).toLocaleDateString('es-ES')}
                  {case_.practice_area && ` • ${case_.practice_area}`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
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
                  <DropdownMenuItem 
                    onClick={handleArchive}
                    disabled={isArchiving}
                  >
                    <Archive className="h-4 w-4 mr-2" />
                    {case_.status === 'closed' ? 'Reabrir' : 'Cerrar'} Expediente
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    className="text-red-600" 
                    onClick={handleDelete}
                    disabled={isDeleting}
                  >
                    Eliminar Expediente
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
              <TabsTrigger value="tasks">Tareas</TabsTrigger>
              <TabsTrigger value="timeline">Timeline</TabsTrigger>
              <TabsTrigger value="documents">Documentos</TabsTrigger>
              <TabsTrigger value="time">Tiempo</TabsTrigger>
            </TabsList>
            
            <div className="mt-6">
              <TabsContent value="overview" className="space-y-6">
                {/* Información básica del expediente */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2">
                    <div className="bg-white p-6 rounded-lg border shadow-sm">
                      <h3 className="text-lg font-semibold mb-4">Información del Expediente</h3>
                      <div className="space-y-4">
                        <div>
                          <span className="font-medium text-gray-700">Título:</span>
                          <span className="ml-2">{case_.title}</span>
                        </div>
                        {case_.description && (
                          <div>
                            <span className="font-medium text-gray-700">Descripción:</span>
                            <p className="mt-1 text-gray-600">{case_.description}</p>
                          </div>
                        )}
                        <div>
                          <span className="font-medium text-gray-700">Área de práctica:</span>
                          <span className="ml-2">{case_.practice_area || 'No especificada'}</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Método de facturación:</span>
                          <span className="ml-2">{case_.billing_method === 'hourly' ? 'Por horas' : case_.billing_method}</span>
                        </div>
                        {case_.estimated_budget && (
                          <div>
                            <span className="font-medium text-gray-700">Presupuesto estimado:</span>
                            <span className="ml-2">€{case_.estimated_budget.toLocaleString()}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="bg-white p-6 rounded-lg border shadow-sm">
                      <h3 className="text-lg font-semibold mb-4">Cliente</h3>
                      {case_.contact ? (
                        <div className="space-y-2">
                          <div className="font-medium">{case_.contact.name}</div>
                          {case_.contact.email && (
                            <div className="text-sm text-gray-600">{case_.contact.email}</div>
                          )}
                          {case_.contact.phone && (
                            <div className="text-sm text-gray-600">{case_.contact.phone}</div>
                          )}
                        </div>
                      ) : (
                        <div className="text-gray-500">Sin cliente asignado</div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Estadísticas del expediente */}
                <CaseStatsPanel caseId={case_.id} />
              </TabsContent>
              
              <TabsContent value="tasks">
                <CaseTasksPanel caseId={case_.id} />
              </TabsContent>
              
              <TabsContent value="timeline">
                <CaseTimeline caseId={case_.id} />
              </TabsContent>
              
              <TabsContent value="documents">
                <div className="bg-white p-12 rounded-lg border shadow-sm text-center">
                  <div className="text-lg font-medium mb-2">Gestión de Documentos</div>
                  <p className="text-sm text-gray-600">Esta funcionalidad estará disponible próximamente</p>
                </div>
              </TabsContent>

              <TabsContent value="time">
                <div className="bg-white p-12 rounded-lg border shadow-sm text-center">
                  <div className="text-lg font-medium mb-2">Registro de Tiempo</div>
                  <p className="text-sm text-gray-600">Esta funcionalidad estará disponible próximamente</p>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </StandardPageContainer>

        {/* Diálogo de edición */}
        <MatterFormDialog
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          onSubmit={handleEditSubmit}
          isLoading={isUpdating}
          initialData={case_}
        />
      </div>
    </div>
  )
}
