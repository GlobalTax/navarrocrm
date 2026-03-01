
import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CalendarIcon, Plus, Trash2, Calculator, Repeat, Clock, Loader2 } from 'lucide-react'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import { useClients } from '@/hooks/useClients'
import { useServiceCatalog } from '@/hooks/useServiceCatalog'
import { useProposalTemplates } from '@/hooks/useProposalTemplates'
import type { CreateProposalData, ProposalLineItem } from '@/types/proposals'
import { toast } from 'sonner'

interface RecurringProposalFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: CreateProposalData & RecurringFields) => void
  isCreating: boolean
  editingProposal?: any // Propuesta a editar (opcional)
  isEditMode?: boolean  // Indica si está en modo edición
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

export function RecurringProposalForm({ 
  open, 
  onOpenChange, 
  onSubmit, 
  isCreating, 
  editingProposal, 
  isEditMode = false 
}: RecurringProposalFormProps) {
  const { clients = [] } = useClients()
  const { services = [] } = useServiceCatalog()
  const { templates = [] } = useProposalTemplates()

  const [formData, setFormData] = useState<CreateProposalData & RecurringFields>(() => {
    // Si estamos editando, precargar los datos
    if (isEditMode && editingProposal) {
      return {
        contact_id: editingProposal.contact_id || '',
        title: editingProposal.title || '',
        description: editingProposal.description || '',
        proposal_type: editingProposal.proposal_type || 'service',
        valid_until: editingProposal.valid_until || '',
        notes: editingProposal.notes || '',
        line_items: editingProposal.line_items || [],
        is_recurring: editingProposal.is_recurring || false,
        recurring_frequency: editingProposal.recurring_frequency || 'monthly',
        auto_renewal: editingProposal.auto_renewal || false,
        retainer_amount: editingProposal.retainer_amount || 0,
        included_hours: editingProposal.included_hours || 0,
        hourly_rate_extra: editingProposal.hourly_rate_extra || 0,
        billing_day: editingProposal.billing_day || 1
      }
    }
    // Valores por defecto para nueva propuesta
    return {
      contact_id: '',
      title: '',
      description: '',
      proposal_type: 'service',
      valid_until: '',
      notes: '',
      line_items: [],
      is_recurring: false,
      auto_renewal: false,
      billing_day: 1
    }
  })

  const [contractStartDate, setContractStartDate] = useState<Date>(() => {
    if (isEditMode && editingProposal?.contract_start_date) {
      return new Date(editingProposal.contract_start_date)
    }
    return undefined
  })
  const [contractEndDate, setContractEndDate] = useState<Date>(() => {
    if (isEditMode && editingProposal?.contract_end_date) {
      return new Date(editingProposal.contract_end_date)
    }
    return undefined
  })

  const handleTemplateSelect = (templateId: string) => {
    const template = templates.find(t => t.id === templateId)
    if (template) {
      setFormData(prev => ({
        ...prev,
        title: `${template.name} - ${clients.find(c => c.id === prev.contact_id)?.name || ''}`,
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
    
    // Validaciones mejoradas
    if (!formData.contact_id || !formData.title) {
      toast.error('Por favor complete los campos obligatorios: Cliente y Título')
      return
    }

    if (formData.line_items.length === 0) {
      toast.error('Debe agregar al menos un servicio a la propuesta')
      return
    }

    // Validar que todos los line_items tienen datos válidos
    const invalidItems = formData.line_items.filter(item => 
      !item.name || item.unit_price <= 0 || item.quantity <= 0
    )
    
    if (invalidItems.length > 0) {
      toast.error('Todos los servicios deben tener nombre, precio y cantidad válidos')
      return
    }

    const submitData = {
      ...formData,
      contract_start_date: contractStartDate?.toISOString().split('T')[0],
      contract_end_date: contractEndDate?.toISOString().split('T')[0]
    }

    console.log('🚀 Enviando propuesta recurrente:', submitData)
    onSubmit(submitData)
    
    // Reset form
    setFormData({
      contact_id: '',
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

  // Funciones para manejar line_items
  const addLineItem = () => {
    const newItem: Omit<ProposalLineItem, 'id' | 'proposal_id'> = {
      service_catalog_id: undefined,
      name: '',
      description: '',
      quantity: 1,
      unit_price: 0,
      total_price: 0,
      billing_unit: 'hour',
      sort_order: formData.line_items.length,
      discount_type: null,
      discount_value: 0,
      discount_amount: 0
    }
    setFormData(prev => ({
      ...prev,
      line_items: [...prev.line_items, newItem]
    }))
  }

  const updateLineItem = (index: number, field: string, value: any) => {
    const updatedItems = [...formData.line_items]
    updatedItems[index] = { 
      ...updatedItems[index], 
      [field]: value 
    }
    
    // Recalcular descuento y total automáticamente
    const item = updatedItems[index]
    if (['quantity', 'unit_price', 'discount_type', 'discount_value'].includes(field)) {
      const gross = item.quantity * item.unit_price
      let discountAmt = 0
      if (item.discount_type === 'percentage' && item.discount_value) {
        discountAmt = gross * (item.discount_value / 100)
      } else if (item.discount_type === 'fixed' && item.discount_value) {
        discountAmt = item.discount_value
      }
      updatedItems[index].discount_amount = Math.max(0, Math.min(discountAmt, gross))
      updatedItems[index].total_price = Math.max(0, gross - updatedItems[index].discount_amount)
    }

    setFormData(prev => ({
      ...prev,
      line_items: updatedItems
    }))
  }

  const removeLineItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      line_items: prev.line_items.filter((_, i) => i !== index)
    }))
  }

  const selectService = (index: number, serviceId: string) => {
    const service = services.find(s => s.id === serviceId)
    if (service) {
      updateLineItem(index, 'service_catalog_id', serviceId)
      updateLineItem(index, 'name', service.name)
      updateLineItem(index, 'description', service.description || '')
      updateLineItem(index, 'unit_price', service.default_price || 0)
      updateLineItem(index, 'billing_unit', service.billing_unit)
      updateLineItem(index, 'total_price', (service.default_price || 0) * formData.line_items[index].quantity)
    }
  }

  const totalAmount = formData.line_items.reduce((sum, item) => sum + item.total_price, 0)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? 'Editar Propuesta Avanzada' : 'Nueva Propuesta Avanzada'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">Información Básica</TabsTrigger>
              <TabsTrigger value="services">Servicios</TabsTrigger>
              <TabsTrigger value="recurring">Configuración Recurrente</TabsTrigger>
              <TabsTrigger value="template">Plantillas</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="client">Cliente *</Label>
                  <Select value={formData.contact_id} onValueChange={(value) => setFormData(prev => ({ ...prev, contact_id: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar cliente" />
                    </SelectTrigger>
                    <SelectContent>
                      {clients.map(client => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.name} ({client.email || 'Sin email'})
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

            <TabsContent value="services" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Servicios y Elementos
                    <Button type="button" variant="outline" size="sm" onClick={addLineItem}>
                      <Plus className="h-4 w-4 mr-2" />
                      Agregar Servicio
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {formData.line_items.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Calculator className="mx-auto h-12 w-12 mb-4 opacity-50" />
                      <p>No hay servicios agregados</p>
                      <p className="text-sm">Agrega al menos un servicio para continuar</p>
                    </div>
                  ) : (
                    formData.line_items.map((item, index) => (
                      <Card key={index} className="border-l-4 border-l-primary">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-sm">Servicio #{index + 1}</CardTitle>
                            <Button 
                              type="button" 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => removeLineItem(index)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent className="grid grid-cols-3 gap-4">
                          <div className="col-span-2 space-y-2">
                            <Label htmlFor={`service-${index}`}>Servicio del Catálogo</Label>
                            <Select onValueChange={(value) => selectService(index, value)}>
                              <SelectTrigger>
                                <SelectValue placeholder="Seleccionar servicio" />
                              </SelectTrigger>
                              <SelectContent>
                                {services.map(service => (
                                  <SelectItem key={service.id} value={service.id}>
                                    {service.name} - €{service.default_price || 0}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor={`quantity-${index}`}>Cantidad</Label>
                            <Input
                              type="number"
                              min="1"
                              id={`quantity-${index}`}
                              value={item.quantity}
                              onChange={(e) => updateLineItem(index, 'quantity', Number(e.target.value))}
                            />
                          </div>

                          <div className="col-span-2 space-y-2">
                            <Label htmlFor={`name-${index}`}>Nombre del Servicio</Label>
                            <Input
                              id={`name-${index}`}
                              value={item.name}
                              onChange={(e) => updateLineItem(index, 'name', e.target.value)}
                              placeholder="Nombre del servicio"
                              required
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor={`unit_price-${index}`}>Precio Unitario (€)</Label>
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              id={`unit_price-${index}`}
                              value={item.unit_price}
                              onChange={(e) => updateLineItem(index, 'unit_price', Number(e.target.value))}
                            />
                          </div>

                          <div className="col-span-3 space-y-2">
                            <Label htmlFor={`description-${index}`}>Descripción</Label>
                            <Textarea
                              id={`description-${index}`}
                              value={item.description}
                              onChange={(e) => updateLineItem(index, 'description', e.target.value)}
                              placeholder="Descripción del servicio"
                              rows={2}
                            />
                          </div>

                          {/* Fila de descuento */}
                          <div className="col-span-3 grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                              <Label>Descuento</Label>
                              <Select 
                                value={item.discount_type || 'none'} 
                                onValueChange={(v) => {
                                  if (v === 'none') {
                                    updateLineItem(index, 'discount_type', null)
                                    updateLineItem(index, 'discount_value', 0)
                                  } else {
                                    updateLineItem(index, 'discount_type', v)
                                  }
                                }}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="none">Sin descuento</SelectItem>
                                  <SelectItem value="percentage">Porcentaje (%)</SelectItem>
                                  <SelectItem value="fixed">Importe fijo (€)</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            {item.discount_type && (
                              <>
                                <div className="space-y-2">
                                  <Label>Valor {item.discount_type === 'percentage' ? '(%)' : '(€)'}</Label>
                                  <Input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    max={item.discount_type === 'percentage' ? 100 : undefined}
                                    value={item.discount_value || 0}
                                    onChange={(e) => updateLineItem(index, 'discount_value', Number(e.target.value))}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label>Dto. aplicado</Label>
                                  <div className="h-10 flex items-center text-sm text-destructive font-medium">
                                    -{new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(item.discount_amount || 0)}
                                  </div>
                                </div>
                              </>
                            )}
                          </div>

                          <div className="col-span-3 flex justify-between items-center pt-2 border-t">
                            <div className="text-sm text-muted-foreground">
                              {item.quantity} × €{item.unit_price}
                              {item.discount_amount ? ` - €${(item.discount_amount || 0).toFixed(2)} dto.` : ''} = 
                            </div>
                            <div className="text-lg font-semibold">
                              €{item.total_price.toLocaleString()}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                  
                  {formData.line_items.length > 0 && (
                    <div className="flex justify-between items-center p-4 bg-primary/5 rounded-lg border">
                      <span className="text-lg font-medium">Total de la Propuesta:</span>
                      <span className="text-2xl font-bold text-primary">
                        €{totalAmount.toLocaleString()}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
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
                  {isEditMode ? 'Actualizando...' : 'Creando...'}
                </>
              ) : (
                isEditMode ? 'Actualizar Propuesta' : 'Crear Propuesta'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
