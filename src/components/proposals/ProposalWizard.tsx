import React, { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ArrowLeft, ArrowRight, CheckCircle, User, Briefcase, Euro, FileText, Eye, Loader2 } from 'lucide-react'
import { useClients } from '@/hooks/useClients'
import { useServiceCatalog } from '@/hooks/useServiceCatalog'
import { toast } from 'sonner'
import type { ProposalFormData } from '@/types/proposals/forms'

interface ProposalWizardProps {
  onBack: () => void
  onSubmit: (data: ProposalFormData) => void
  isCreating: boolean
  editingProposal?: any
  isEditMode?: boolean
}

const STEPS = [
  { id: 'client', label: 'Cliente', icon: User },
  { id: 'services', label: 'Servicios', icon: Briefcase },
  { id: 'pricing', label: 'Honorarios', icon: Euro },
  { id: 'content', label: 'Contenido', icon: FileText },
  { id: 'review', label: 'Revisión', icon: Eye }
]

export const ProposalWizard: React.FC<ProposalWizardProps> = ({
  onBack,
  onSubmit,
  isCreating,
  editingProposal,
  isEditMode = false
}) => {
  const { clients = [] } = useClients()
  const { services = [] } = useServiceCatalog()
  
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState<ProposalFormData>(() => {
    if (isEditMode && editingProposal) {
      return {
        clientId: editingProposal.contact_id || '',
        title: editingProposal.title || '',
        selectedServices: editingProposal.selectedServices || [],
        introduction: editingProposal.introduction || editingProposal.description || '',
        terms: editingProposal.terms || '',
        validityDays: editingProposal.validity_days || 30,
        is_recurring: editingProposal.is_recurring || false,
        recurring_frequency: editingProposal.recurring_frequency || 'monthly',
        retainerConfig: {
          retainerAmount: editingProposal.retainer_amount || 0,
          includedHours: editingProposal.included_hours || 0,
          extraHourlyRate: editingProposal.hourly_rate_extra || 0,
          billingDay: editingProposal.billing_day || 1,
          autoRenewal: editingProposal.auto_renewal || false
        },
        currency: 'EUR'
      }
    }
    return {
      clientId: '',
      title: '',
      selectedServices: [],
      introduction: '',
      terms: '',
      validityDays: 30,
      is_recurring: false,
      recurring_frequency: 'monthly',
      retainerConfig: {
        retainerAmount: 0,
        includedHours: 0,
        extraHourlyRate: 0,
        billingDay: 1,
        autoRenewal: false
      },
      currency: 'EUR'
    }
  })

  const selectedClient = clients.find(c => c.id === formData.clientId)

  const totals = useMemo(() => {
    const subtotal = formData.selectedServices.reduce((sum, service) => sum + (service.total || 0), 0)
    const total = subtotal + (formData.retainerConfig?.retainerAmount || 0)
    return { subtotal, total }
  }, [formData.selectedServices, formData.retainerConfig])

  const updateFormData = (field: keyof ProposalFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const addService = () => {
    const newService = {
      id: crypto.randomUUID(),
      name: '',
      description: '',
      basePrice: 0,
      customPrice: 0,
      quantity: 1,
      billingUnit: 'hora',
      total: 0
    }
    updateFormData('selectedServices', [...formData.selectedServices, newService])
  }

  const updateService = (index: number, field: string, value: any) => {
    const updatedServices = [...formData.selectedServices]
    updatedServices[index] = { ...updatedServices[index], [field]: value }
    
    if (field === 'quantity' || field === 'customPrice') {
      updatedServices[index].total = (updatedServices[index].quantity || 1) * (updatedServices[index].customPrice || 0)
    }
    
    updateFormData('selectedServices', updatedServices)
  }

  const removeService = (index: number) => {
    updateFormData('selectedServices', formData.selectedServices.filter((_, i) => i !== index))
  }

  const selectService = (index: number, serviceId: string) => {
    const service = services.find(s => s.id === serviceId)
    if (service) {
      updateService(index, 'name', service.name)
      updateService(index, 'description', service.description || '')
      updateService(index, 'customPrice', service.default_price || 0)
      updateService(index, 'billingUnit', service.billing_unit || 'hora')
      updateService(index, 'total', (service.default_price || 0) * (formData.selectedServices[index].quantity || 1))
    }
  }

  const canProceed = () => {
    switch (currentStep) {
      case 0: // Cliente
        return formData.clientId && formData.title
      case 1: // Servicios
        return formData.selectedServices.length > 0 && formData.selectedServices.every(s => s.name && (s.customPrice || 0) > 0)
      case 2: // Honorarios
        return true // Siempre puede proceder
      case 3: // Contenido
        return formData.introduction
      case 4: // Revisión
        return true
      default:
        return false
    }
  }

  const nextStep = () => {
    if (canProceed() && currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = () => {
    if (!canProceed()) {
      toast.error('Por favor completa todos los campos requeridos')
      return
    }

    // Validaciones finales
    if (formData.selectedServices.length === 0) {
      toast.error('Debe agregar al menos un servicio')
      return
    }

    const invalidServices = formData.selectedServices.filter(s => !s.name || (s.customPrice || 0) <= 0)
    if (invalidServices.length > 0) {
      toast.error('Todos los servicios deben tener nombre y precio válidos')
      return
    }

    onSubmit(formData)
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Cliente
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-semibold mb-2">Información del Cliente</h2>
              <p className="text-muted-foreground">Selecciona el cliente y define el título de la propuesta</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="client">Cliente *</Label>
                <Select value={formData.clientId} onValueChange={(value) => updateFormData('clientId', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map(client => (
                      <SelectItem key={client.id} value={client.id}>
                        <div className="flex flex-col">
                          <span>{client.name}</span>
                          <span className="text-sm text-muted-foreground">{client.email || 'Sin email'}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  {clients.length} clientes disponibles
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Título de la Propuesta *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => updateFormData('title', e.target.value)}
                  placeholder="Ej: Servicios de Asesoramiento Fiscal"
                />
              </div>
            </div>


            {selectedClient && (
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-4">
                  <h4 className="font-medium text-blue-900 mb-2">Cliente Seleccionado</h4>
                  <div className="text-sm text-blue-700">
                    <p><strong>Nombre:</strong> {selectedClient.name}</p>
                    <p><strong>Email:</strong> {selectedClient.email || 'No disponible'}</p>
                    <p><strong>Tipo:</strong> {selectedClient.client_type || 'Particular'}</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )

      case 1: // Servicios
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-semibold mb-2">Servicios y Elementos</h2>
              <p className="text-muted-foreground">Define los servicios que incluirá la propuesta</p>
            </div>

            <div className="space-y-4">
              {formData.selectedServices.map((service, index) => (
                <Card key={service.id} className="border-l-4 border-l-primary">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm">Servicio #{index + 1}</CardTitle>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => removeService(index)}
                        className="text-destructive hover:text-destructive"
                      >
                        Eliminar
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="grid grid-cols-3 gap-4">
                    <div className="col-span-2 space-y-2">
                      <Label>Servicio del Catálogo</Label>
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
                      <Label>Cantidad</Label>
                      <Input
                        type="number"
                        min="1"
                        value={service.quantity}
                        onChange={(e) => updateService(index, 'quantity', Number(e.target.value))}
                      />
                    </div>

                    <div className="col-span-2 space-y-2">
                      <Label>Nombre del Servicio *</Label>
                      <Input
                        value={service.name}
                        onChange={(e) => updateService(index, 'name', e.target.value)}
                        placeholder="Nombre del servicio"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Precio Unitario (€) *</Label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={service.customPrice}
                        onChange={(e) => updateService(index, 'customPrice', Number(e.target.value))}
                      />
                    </div>

                    <div className="col-span-3 space-y-2">
                      <Label>Descripción</Label>
                      <Textarea
                        value={service.description}
                        onChange={(e) => updateService(index, 'description', e.target.value)}
                        placeholder="Descripción del servicio"
                        rows={2}
                      />
                    </div>

                    <div className="col-span-3 flex justify-between items-center pt-2 border-t">
                      <div className="text-sm text-muted-foreground">
                        {service.quantity || 1} × €{service.customPrice || 0} = 
                      </div>
                      <div className="text-lg font-semibold">
                        €{service.total?.toLocaleString() || 0}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              <Button type="button" variant="outline" onClick={addService} className="w-full">
                <Briefcase className="h-4 w-4 mr-2" />
                Agregar Servicio
              </Button>

              {formData.selectedServices.length > 0 && (
                <Card className="bg-primary/5 border-primary/20">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Total Servicios:</span>
                      <span className="text-xl font-bold text-primary">
                        €{totals.subtotal.toLocaleString()}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )

      case 2: // Honorarios
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-semibold mb-2">Configuración de Honorarios</h2>
              <p className="text-muted-foreground">Define la estructura de precios y facturación</p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Configuración Recurrente</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="is_recurring"
                    checked={formData.is_recurring}
                    onChange={(e) => updateFormData('is_recurring', e.target.checked)}
                  />
                  <Label htmlFor="is_recurring">Propuesta Recurrente</Label>
                </div>

                {formData.is_recurring && (
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Cuota Base (€)</Label>
                      <Input
                        type="number"
                        value={formData.retainerConfig?.retainerAmount || 0}
                        onChange={(e) => updateFormData('retainerConfig', {
                          ...formData.retainerConfig,
                          retainerAmount: Number(e.target.value)
                        })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Horas Incluidas</Label>
                      <Input
                        type="number"
                        value={formData.retainerConfig?.includedHours || 0}
                        onChange={(e) => updateFormData('retainerConfig', {
                          ...formData.retainerConfig,
                          includedHours: Number(e.target.value)
                        })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>€/hora Extra</Label>
                      <Input
                        type="number"
                        value={formData.retainerConfig?.extraHourlyRate || 0}
                        onChange={(e) => updateFormData('retainerConfig', {
                          ...formData.retainerConfig,
                          extraHourlyRate: Number(e.target.value)
                        })}
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-6">
                <h4 className="font-semibold text-green-900 mb-4">Resumen Económico</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Servicios:</span>
                    <span className="font-medium">€{totals.subtotal.toLocaleString()}</span>
                  </div>
                  {formData.is_recurring && formData.retainerConfig?.retainerAmount && (
                    <div className="flex justify-between">
                      <span>Cuota Base:</span>
                      <span className="font-medium">€{formData.retainerConfig.retainerAmount.toLocaleString()}</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between text-lg font-bold text-green-900">
                    <span>Total:</span>
                    <span>€{totals.total.toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )

      case 3: // Contenido
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-semibold mb-2">Contenido de la Propuesta</h2>
              <p className="text-muted-foreground">Personaliza los textos de introducción y términos</p>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="introduction">Introducción *</Label>
                <Textarea
                  id="introduction"
                  value={formData.introduction}
                  onChange={(e) => updateFormData('introduction', e.target.value)}
                  placeholder="Texto introductorio de la propuesta..."
                  rows={6}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="terms">Términos y Condiciones</Label>
                <Textarea
                  id="terms"
                  value={formData.terms}
                  onChange={(e) => updateFormData('terms', e.target.value)}
                  placeholder="Términos y condiciones específicos..."
                  rows={6}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="validity">Validez de la Propuesta (días)</Label>
                <Input
                  type="number"
                  id="validity"
                  value={formData.validityDays}
                  onChange={(e) => updateFormData('validityDays', Number(e.target.value))}
                  placeholder="30"
                />
              </div>
            </div>
          </div>
        )

      case 4: // Revisión
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-semibold mb-2">Revisión Final</h2>
              <p className="text-muted-foreground">Revisa todos los datos antes de crear la propuesta</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm text-muted-foreground">CLIENTE</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="font-medium">{selectedClient?.name}</p>
                  <p className="text-sm text-muted-foreground">{selectedClient?.email}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm text-muted-foreground">PROPUESTA</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="font-medium">{formData.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {formData.is_recurring ? 'Recurrente' : 'Puntual'} • Válida {formData.validityDays} días
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Servicios ({formData.selectedServices.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {formData.selectedServices.map((service, index) => (
                    <div key={service.id} className="flex justify-between items-center py-2 border-b last:border-b-0">
                      <div>
                        <p className="font-medium">{service.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {service.quantity || 1} × €{service.customPrice || 0}
                        </p>
                      </div>
                      <p className="font-medium">€{service.total?.toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="p-6">
                <div className="flex justify-between items-center text-lg">
                  <span className="font-semibold">Total de la Propuesta:</span>
                  <span className="font-bold text-primary text-xl">
                    €{totals.total.toLocaleString()}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="max-w-4xl mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>
        <div>
          <h1 className="text-2xl font-bold">
            {isEditMode ? 'Editar Propuesta' : 'Nueva Propuesta'}
          </h1>
          <p className="text-muted-foreground">
            Paso {currentStep + 1} de {STEPS.length}
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-4">
        <div className="flex justify-between">
          {STEPS.map((step, index) => {
            const Icon = step.icon
            const isActive = index === currentStep
            const isCompleted = index < currentStep
            
            return (
              <div key={step.id} className="flex flex-col items-center space-y-2">
                <div className={`
                  w-12 h-12 rounded-full flex items-center justify-center border-2 transition-colors
                  ${isActive ? 'border-primary bg-primary text-primary-foreground' : 
                    isCompleted ? 'border-green-500 bg-green-500 text-white' : 
                    'border-muted-foreground bg-background'
                  }
                `}>
                  {isCompleted ? <CheckCircle className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                </div>
                <div className="text-center">
                  <p className={`text-sm font-medium ${isActive ? 'text-primary' : isCompleted ? 'text-green-600' : 'text-muted-foreground'}`}>
                    {step.label}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
        
        <div className="w-full bg-muted rounded-full h-2">
          <div 
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Content */}
      <Card className="min-h-[600px]">
        <CardContent className="p-8">
          {renderStepContent()}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={prevStep}
          disabled={currentStep === 0}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Anterior
        </Button>

        <div className="flex gap-2">
          {currentStep === STEPS.length - 1 ? (
            <Button onClick={handleSubmit} disabled={!canProceed() || isCreating}>
              {isCreating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  {isEditMode ? 'Actualizando...' : 'Creando...'}
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  {isEditMode ? 'Actualizar Propuesta' : 'Crear Propuesta'}
                </>
              )}
            </Button>
          ) : (
            <Button
              onClick={nextStep}
              disabled={!canProceed()}
            >
              Siguiente
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}