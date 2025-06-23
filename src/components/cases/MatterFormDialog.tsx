
import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Plus, Loader2, Users, Bell, CheckSquare } from 'lucide-react'
import { useClients } from '@/hooks/useClients'
import { usePracticeAreas } from '@/hooks/usePracticeAreas'
import { useUsers } from '@/hooks/useUsers'
import { useMatterTemplates } from '@/hooks/useMatterTemplates'
import { CreateCaseData } from '@/hooks/useCases'
import { MatterTemplateSelector } from './MatterTemplateSelector'
import { MatterDetailsForm } from './MatterDetailsForm'
import { MatterBillingForm } from './MatterBillingForm'
import { MatterPlaceholderCard } from './MatterPlaceholderCard'

interface MatterFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: CreateCaseData) => void
  isLoading?: boolean
}

export function MatterFormDialog({ open, onOpenChange, onSubmit, isLoading }: MatterFormDialogProps) {
  const { clients = [] } = useClients()
  const { practiceAreas = [] } = usePracticeAreas()
  const { users = [] } = useUsers()
  const { templates = [] } = useMatterTemplates()

  const [formData, setFormData] = useState<CreateCaseData & { template_selection: string }>({
    title: '',
    description: '',
    status: 'open',
    contact_id: '',
    practice_area: '',
    responsible_solicitor_id: '',
    originating_solicitor_id: '',
    billing_method: 'hourly',
    estimated_budget: undefined,
    template_selection: 'none'
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const submitData: CreateCaseData = {
      title: formData.title,
      description: formData.description,
      status: formData.status,
      contact_id: formData.contact_id,
      practice_area: formData.practice_area === 'none' ? undefined : formData.practice_area,
      responsible_solicitor_id: formData.responsible_solicitor_id === 'none' ? undefined : formData.responsible_solicitor_id,
      originating_solicitor_id: formData.originating_solicitor_id === 'none' ? undefined : formData.originating_solicitor_id,
      billing_method: formData.billing_method,
      estimated_budget: formData.estimated_budget
    }
    
    onSubmit(submitData)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Nuevo Expediente</DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="template" className="mt-6">
            <TabsList className="grid w-full grid-cols-8">
              <TabsTrigger value="template">Plantilla</TabsTrigger>
              <TabsTrigger value="details">Detalles</TabsTrigger>
              <TabsTrigger value="permissions">Permisos</TabsTrigger>
              <TabsTrigger value="notifications">Notificaciones</TabsTrigger>
              <TabsTrigger value="contacts">Contactos</TabsTrigger>
              <TabsTrigger value="fields">Campos</TabsTrigger>
              <TabsTrigger value="billing">Facturación</TabsTrigger>
              <TabsTrigger value="workflow">Workflow</TabsTrigger>
            </TabsList>

            <TabsContent value="template" className="space-y-4">
              <MatterTemplateSelector
                templates={templates}
                selectedTemplate={formData.template_selection}
                onTemplateChange={(value) => setFormData({...formData, template_selection: value})}
              />
            </TabsContent>

            <TabsContent value="details" className="space-y-4">
              <MatterDetailsForm
                title={formData.title}
                description={formData.description || ''}
                clientId={formData.contact_id}
                practiceArea={formData.practice_area || ''}
                responsibleSolicitorId={formData.responsible_solicitor_id || ''}
                status={formData.status}
                clients={clients}
                practiceAreas={practiceAreas}
                users={users}
                onTitleChange={(value) => setFormData({...formData, title: value})}
                onDescriptionChange={(value) => setFormData({...formData, description: value})}
                onClientChange={(value) => setFormData({...formData, contact_id: value})}
                onPracticeAreaChange={(value) => setFormData({...formData, practice_area: value})}
                onResponsibleSolicitorChange={(value) => setFormData({...formData, responsible_solicitor_id: value})}
                onStatusChange={(value) => setFormData({...formData, status: value as 'open' | 'on_hold' | 'closed'})}
              />
            </TabsContent>

            <TabsContent value="permissions" className="space-y-4">
              <MatterPlaceholderCard
                icon={Users}
                title="Permisos del Expediente"
                description="Configura quién puede acceder y editar este expediente"
              />
            </TabsContent>

            <TabsContent value="notifications" className="space-y-4">
              <MatterPlaceholderCard
                icon={Bell}
                title="Notificaciones del Expediente"
                description="Configura las notificaciones para este expediente"
              />
            </TabsContent>

            <TabsContent value="contacts" className="space-y-4">
              <MatterPlaceholderCard
                icon={Users}
                title="Contactos Relacionados"
                description="Añade contactos adicionales relacionados con este expediente"
              />
            </TabsContent>

            <TabsContent value="fields" className="space-y-4">
              <MatterPlaceholderCard
                icon={Users}
                title="Campos Personalizados"
                description="Añade campos específicos para este tipo de expediente"
              />
            </TabsContent>

            <TabsContent value="billing" className="space-y-4">
              <MatterBillingForm
                billingMethod={formData.billing_method || 'hourly'}
                estimatedBudget={formData.estimated_budget}
                onBillingMethodChange={(value) => setFormData({...formData, billing_method: value as 'hourly' | 'fixed' | 'contingency' | 'retainer'})}
                onEstimatedBudgetChange={(value) => setFormData({...formData, estimated_budget: value})}
              />
            </TabsContent>

            <TabsContent value="workflow" className="space-y-4">
              <MatterPlaceholderCard
                icon={CheckSquare}
                title="Listas de Tareas y Carpetas"
                description="Configura las tareas y organización de documentos"
              />
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-3 pt-6 border-t mt-6">
            <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading || !formData.title || !formData.contact_id}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Creando...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Crear Expediente
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
