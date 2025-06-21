
import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Loader2, CalendarIcon } from 'lucide-react'
import { useClients } from '@/hooks/useClients'
import { useProposalTemplates } from '@/hooks/useProposalTemplates'
import { CreateProposalData } from '@/hooks/useProposals'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { cn } from '@/lib/utils'

interface RecurringProposalFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: CreateProposalData & RecurringFields) => void
  isCreating: boolean
}

interface RecurringFields {
  is_recurring: boolean
  recurring_frequency?: 'monthly' | 'quarterly' | 'yearly'
  contract_start_date?: string
  contract_end_date?: string
  auto_renewal: boolean
  retainer_amount?: number
  included_hours?: number
  hourly_rate_extra?: number
  billing_day?: number
}

export function RecurringProposalForm({ open, onOpenChange, onSubmit, isCreating }: RecurringProposalFormProps) {
  const { clients = [] } = useClients()
  const { templates = [] } = useProposalTemplates()

  const [formData, setFormData] = useState<CreateProposalData & RecurringFields>({
    client_id: '',
    title: '',
    description: '',
    proposal_type: 'service',
    valid_until: '',
    notes: '',
    line_items: [],
    is_recurring: false,
    auto_renewal: false,
    billing_day: 1
  })

  const [contractStartDate, setContractStartDate] = useState<Date>()
  const [contractEndDate, setContractEndDate] = useState<Date>()

  const handleTemplateSelect = (templateId: string) => {
    const template = templates.find(t => t.id === templateId)
    if (template) {
      setFormData(prev => ({
        ...prev,
        title: `${template.name} - ${clients.find(c => c.id === prev.client_id)?.name || ''}`,
        description: template.description || '',
        proposal_type: template.template_type === 'project' ? 'project' : 
                      template.template_type === 'retainer' ? 'retainer' : 'service',
        is_recurring: template.is_recurring,
        recurring_frequency: template.default_frequency,
        retainer_amount: template.default_retainer_amount || 0,
        included_hours: template.default_included_hours || 0,
        hourly_rate_extra: template.default_hourly_rate || 0
      }))
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.client_id || !formData.title) {
      return
    }

    const submitData = {
      ...formData,
      contract_start_date: contractStartDate?.toISOString().split('T')[0],
      contract_end_date: contractEndDate?.toISOString().split('T')[0]
    }

    onSubmit(submitData)
    
    // Reset form
    setFormData({
      client_id: '',
      title: '',
      description: '',
      proposal_type: 'service',
      valid_until: '',
      notes: '',
      line_items: [],
      is_recurring: false,
      auto_renewal: false,
      billing_day: 1
    })
    setContractStartDate(undefined)
    setContractEndDate(undefined)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nueva Propuesta Avanzada</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">Información Básica</TabsTrigger>
              <TabsTrigger value="recurring">Configuración Recurrente</TabsTrigger>
              <TabsTrigger value="template">Plantillas</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="client">Cliente *</Label>
                  <Select value={formData.client_id} onValueChange={(value) => setFormData(prev => ({ ...prev, client_id: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar cliente" />
                    </SelectTrigger>
                    <SelectContent>
                      {clients.map(client => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="proposal_type">Tipo de Propuesta</Label>
                  <Select value={formData.proposal_type} onValueChange={(value: any) => setFormData(prev => ({ ...prev, proposal_type: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="service">Servicios</SelectItem>
                      <SelectItem value="retainer">Retainer</SelectItem>
                      <SelectItem value="project">Proyecto</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Título *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Título de la propuesta"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Descripción de la propuesta"
                />
              </div>
            </TabsContent>

            <TabsContent value="recurring" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Configuración Recurrente
                    <Switch
                      checked={formData.is_recurring}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_recurring: checked }))}
                    />
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {formData.is_recurring && (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Frecuencia de Facturación</Label>
                          <Select value={formData.recurring_frequency} onValueChange={(value: any) => setFormData(prev => ({ ...prev, recurring_frequency: value }))}>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar frecuencia" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="monthly">Mensual</SelectItem>
                              <SelectItem value="quarterly">Trimestral</SelectItem>
                              <SelectItem value="yearly">Anual</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label>Día de Facturación</Label>
                          <Input
                            type="number"
                            min="1"
                            max="28"
                            value={formData.billing_day}
                            onChange={(e) => setFormData(prev => ({ ...prev, billing_day: Number(e.target.value) }))}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Fecha de Inicio del Contrato</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full justify-start text-left font-normal",
                                  !contractStartDate && "text-muted-foreground"
                                )}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {contractStartDate ? (
                                  format(contractStartDate, "dd MMM yyyy", { locale: es })
                                ) : (
                                  "Seleccionar fecha"
                                )}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                              <Calendar
                                mode="single"
                                selected={contractStartDate}
                                onSelect={setContractStartDate}
                                locale={es}
                              />
                            </PopoverContent>
                          </Popover>
                        </div>

                        <div className="space-y-2">
                          <Label>Fecha de Fin del Contrato (Opcional)</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full justify-start text-left font-normal",
                                  !contractEndDate && "text-muted-foreground"
                                )}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {contractEndDate ? (
                                  format(contractEndDate, "dd MMM yyyy", { locale: es })
                                ) : (
                                  "Seleccionar fecha"
                                )}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                              <Calendar
                                mode="single"
                                selected={contractEndDate}
                                onSelect={setContractEndDate}
                                locale={es}
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                      </div>

                      {formData.proposal_type === 'retainer' && (
                        <div className="grid grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label>Importe del Retainer (€)</Label>
                            <Input
                              type="number"
                              value={formData.retainer_amount || 0}
                              onChange={(e) => setFormData(prev => ({ ...prev, retainer_amount: Number(e.target.value) }))}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label>Horas Incluidas</Label>
                            <Input
                              type="number"
                              value={formData.included_hours || 0}
                              onChange={(e) => setFormData(prev => ({ ...prev, included_hours: Number(e.target.value) }))}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label>€/hora Extra</Label>
                            <Input
                              type="number"
                              value={formData.hourly_rate_extra || 0}
                              onChange={(e) => setFormData(prev => ({ ...prev, hourly_rate_extra: Number(e.target.value) }))}
                            />
                          </div>
                        </div>
                      )}

                      <div className="flex items-center space-x-2">
                        <Switch
                          id="auto_renewal"
                          checked={formData.auto_renewal}
                          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, auto_renewal: checked }))}
                        />
                        <Label htmlFor="auto_renewal">Renovación Automática</Label>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="template" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Usar Plantilla Existente</CardTitle>
                </CardHeader>
                <CardContent>
                  <Select onValueChange={handleTemplateSelect}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar plantilla" />
                    </SelectTrigger>
                    <SelectContent>
                      {templates.map(template => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.name} - {template.template_type}
                          {template.is_recurring && ` (${template.default_frequency})`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isCreating}>
              {isCreating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Creando...
                </>
              ) : (
                'Crear Propuesta'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
