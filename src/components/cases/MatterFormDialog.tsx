import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  Plus, 
  Loader2, 
  FileText,
  Users, 
  Bell, 
  Settings, 
  CreditCard, 
  CheckSquare,
  FolderOpen,
  X
} from 'lucide-react'
import { useClients } from '@/hooks/useClients'
import { usePracticeAreas } from '@/hooks/usePracticeAreas'
import { useUsers } from '@/hooks/useUsers'
import { useMatterTemplates } from '@/hooks/useMatterTemplates'
import { CreateCaseData } from '@/hooks/useCases'

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

  const [formData, setFormData] = useState<CreateCaseData & {
    template_selection: string
    custom_fields: Record<string, string>
    notifications: string[]
    permissions: Array<{ user_id: string; permission: string }>
    task_lists: string[]
    document_folders: string[]
  }>({
    title: '',
    description: '',
    status: 'open',
    client_id: '',
    practice_area: '',
    responsible_solicitor_id: '',
    originating_solicitor_id: '',
    billing_method: 'hourly',
    estimated_budget: undefined,
    template_selection: '',
    custom_fields: {},
    notifications: [],
    permissions: [],
    task_lists: [],
    document_folders: []
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target
    setFormData(prev => ({ ...prev, [id]: value }))
  }

  const handleSelectChange = (id: string, value: string) => {
    setFormData(prev => ({ ...prev, [id]: value }))
  }

  const handleNumberChange = (id: string, value: number | undefined) => {
    setFormData(prev => ({ ...prev, [id]: value }))
  }

  const handleCheckboxChange = (id: string, checked: boolean) => {
    setFormData(prev => ({ ...prev, [id]: checked }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const submitData: CreateCaseData = {
      title: formData.title,
      description: formData.description,
      status: formData.status,
      client_id: formData.client_id,
      practice_area: formData.practice_area || undefined,
      responsible_solicitor_id: formData.responsible_solicitor_id || undefined,
      originating_solicitor_id: formData.originating_solicitor_id || undefined,
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
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Información de Plantilla
                  </CardTitle>
                  <CardDescription>
                    Selecciona una plantilla para pre-configurar el expediente
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-2">
                    <Label>Plantilla de Expediente</Label>
                    <Select 
                      value={formData.template_selection} 
                      onValueChange={(value) => setFormData({...formData, template_selection: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar plantilla..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Sin plantilla</SelectItem>
                        {templates.map((template) => (
                          <SelectItem key={template.id} value={template.id}>
                            <div className="flex items-center gap-2">
                              <span>{template.name}</span>
                              {template.practice_area && (
                                <Badge variant="outline" className="text-xs">
                                  {template.practice_area.name}
                                </Badge>
                              )}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="details" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Detalles del Expediente</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="title">Título del Expediente *</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        placeholder="Ej: Compraventa inmueble - Juan Pérez"
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="client">Cliente *</Label>
                      <Select 
                        value={formData.client_id} 
                        onValueChange={(value) => setFormData({...formData, client_id: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar cliente..." />
                        </SelectTrigger>
                        <SelectContent>
                          {clients.map((client) => (
                            <SelectItem key={client.id} value={client.id}>
                              {client.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="grid gap-2">
                      <Label>Área de Práctica</Label>
                      <Select 
                        value={formData.practice_area || ''} 
                        onValueChange={(value) => setFormData({...formData, practice_area: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar área..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Sin especificar</SelectItem>
                          {practiceAreas.map((area) => (
                            <SelectItem key={area.id} value={area.name}>
                              {area.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label>Abogado Responsable</Label>
                      <Select 
                        value={formData.responsible_solicitor_id || ''} 
                        onValueChange={(value) => setFormData({...formData, responsible_solicitor_id: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar abogado..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Sin asignar</SelectItem>
                          {users.map((user) => (
                            <SelectItem key={user.id} value={user.id}>
                              {user.email}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label>Estado</Label>
                      <Select 
                        value={formData.status} 
                        onValueChange={(value) => setFormData({...formData, status: value})}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="open">Abierto</SelectItem>
                          <SelectItem value="on_hold">En espera</SelectItem>
                          <SelectItem value="closed">Cerrado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="description">Descripción</Label>
                    <Textarea
                      id="description"
                      value={formData.description || ''}
                      onChange={handleInputChange}
                      placeholder="Descripción detallada del expediente..."
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="permissions" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Permisos del Expediente
                  </CardTitle>
                  <CardDescription>
                    Configura quién puede acceder y editar este expediente
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Los permisos se configurarán después de crear el expediente.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notifications" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    Notificaciones del Expediente
                  </CardTitle>
                  <CardDescription>
                    Configura las notificaciones para este expediente
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Las notificaciones se configurarán después de crear el expediente.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="contacts" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Contactos Relacionados</CardTitle>
                  <CardDescription>
                    Añade contactos adicionales relacionados con este expediente
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Los contactos relacionados se configurarán después de crear el expediente.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="fields" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Campos Personalizados</CardTitle>
                  <CardDescription>
                    Añade campos específicos para este tipo de expediente
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Los campos personalizados se configurarán después de crear el expediente.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="billing" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Preferencias de Facturación
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label>Método de Facturación</Label>
                      <Select 
                        value={formData.billing_method || 'hourly'} 
                        onValueChange={(value) => setFormData({...formData, billing_method: value})}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="hourly">Por Horas</SelectItem>
                          <SelectItem value="fixed">Tarifa Fija</SelectItem>
                          <SelectItem value="contingency">Contingencia</SelectItem>
                          <SelectItem value="retainer">Anticipo</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label>Presupuesto Estimado</Label>
                      <Input
                        type="number"
                        value={formData.estimated_budget || ''}
                        onChange={(e) => setFormData({...formData, estimated_budget: e.target.value ? parseFloat(e.target.value) : undefined})}
                        placeholder="0.00"
                        step="0.01"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="workflow" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckSquare className="h-5 w-5" />
                    Listas de Tareas y Carpetas
                  </CardTitle>
                  <CardDescription>
                    Configura las tareas y organización de documentos
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Las listas de tareas y carpetas se configurarán después de crear el expediente.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-3 pt-6 border-t mt-6">
            <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading || !formData.title || !formData.client_id}>
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
