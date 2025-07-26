
import { useParams, useNavigate } from 'react-router-dom'
import { Edit, Archive, MoreHorizontal, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu'
import { StandardPageContainer } from '@/components/layout/StandardPageContainer'
import { DetailPageHeader } from '@/components/layout/DetailPageHeader'
import { CaseStatsPanel } from '@/components/cases/stats/CaseStatsPanel'
import { CaseTimeline } from '@/components/cases/timeline/CaseTimeline'
import { CaseTasksPanel } from '@/components/cases/tasks/CaseTasksPanel'
import { CaseDocumentsPanel } from '@/components/cases/documents/CaseDocumentsPanel'
import { CaseTimePanel } from '@/components/cases/time/CaseTimePanel'
import { useCasesList } from '@/features/cases'
import { MatterFormDialog } from '@/components/cases/MatterFormDialog'
import { useState } from 'react'

const getStatusColor = (status: string) => {
  switch (status) {
    case 'open':
      return 'bg-chart-1/10 text-chart-1 border-chart-1/20'
    case 'on_hold':
      return 'bg-chart-4/10 text-chart-4 border-chart-4/20'
    case 'closed':
      return 'bg-chart-2/10 text-chart-2 border-chart-2/20'
    default:
      return 'bg-muted/50 text-muted-foreground border-border'
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
  const { cases, isLoading, updateCase, deleteCase, archiveCase, isUpdating, isDeleting, isArchiving } = useCasesList()
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Cargando expediente...</p>
        </div>
      </div>
    )
  }

  const case_ = cases.find(c => c.id === id)

  if (!case_) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">Expediente no encontrado</h1>
          <p className="text-muted-foreground mb-4">El expediente que buscas no existe o no tienes permisos para verlo.</p>
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

  const breadcrumbItems = [
    { label: 'Expedientes', href: '/cases' },
    { label: case_.title }
  ]

  const subtitle = `Creado el ${new Date(case_.created_at).toLocaleDateString('es-ES')}${case_.practice_area ? ` • ${case_.practice_area}` : ''}`

  return (
    <div className="min-h-screen bg-background">
      <DetailPageHeader
        title={case_.title}
        subtitle={subtitle}
        breadcrumbItems={breadcrumbItems}
        backUrl="/cases"
      >
        <Badge variant="outline" className={getStatusColor(case_.status)}>
          {getStatusLabel(case_.status)}
        </Badge>
        
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
      </DetailPageHeader>

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
                    <div className="bg-card p-6 rounded-lg border shadow-sm">
                      <h3 className="text-lg font-semibold mb-4 text-card-foreground">Información del Expediente</h3>
                      <div className="space-y-4">
                        <div>
                          <span className="font-medium text-muted-foreground">Título:</span>
                          <span className="ml-2 text-card-foreground">{case_.title}</span>
                        </div>
                        {case_.description && (
                          <div>
                            <span className="font-medium text-muted-foreground">Descripción:</span>
                            <p className="mt-1 text-card-foreground">{case_.description}</p>
                          </div>
                        )}
                        <div>
                          <span className="font-medium text-muted-foreground">Área de práctica:</span>
                          <span className="ml-2 text-card-foreground">{case_.practice_area || 'No especificada'}</span>
                        </div>
                        <div>
                          <span className="font-medium text-muted-foreground">Método de facturación:</span>
                          <span className="ml-2 text-card-foreground">{case_.billing_method === 'hourly' ? 'Por horas' : case_.billing_method}</span>
                        </div>
                        {case_.estimated_budget && (
                          <div>
                            <span className="font-medium text-muted-foreground">Presupuesto estimado:</span>
                            <span className="ml-2 text-card-foreground">€{case_.estimated_budget.toLocaleString()}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="bg-card p-6 rounded-lg border shadow-sm">
                      <h3 className="text-lg font-semibold mb-4 text-card-foreground">Cliente</h3>
                      {case_.contact ? (
                        <div className="space-y-2">
                          <div className="font-medium text-card-foreground">{case_.contact.name}</div>
                          {case_.contact.email && (
                            <div className="text-sm text-muted-foreground">{case_.contact.email}</div>
                          )}
                          {case_.contact.phone && (
                            <div className="text-sm text-muted-foreground">{case_.contact.phone}</div>
                          )}
                        </div>
                      ) : (
                        <div className="text-muted-foreground">Sin cliente asignado</div>
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
                <CaseDocumentsPanel caseId={case_.id} />
              </TabsContent>

              <TabsContent value="time">
                <CaseTimePanel caseId={case_.id} />
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
