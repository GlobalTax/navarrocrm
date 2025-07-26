
import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Plus, Trash2, Calendar, TrendingUp } from 'lucide-react'
import { ProposalPhase, ProposalService } from '@/hooks/useProposalProfessional'
import { Button as UIButton } from '@/components/ui/button'
import { PhaseDashboard } from '@/components/phases/PhaseDashboard'

interface PhaseManagerProps {
  phases: ProposalPhase[]
  onPhasesChange: (phases: ProposalPhase[]) => void
  enableAdvancedMode?: boolean
}

export const PhaseManager: React.FC<PhaseManagerProps> = ({ 
  phases, 
  onPhasesChange, 
  enableAdvancedMode = false 
}) => {
  
  // Si el modo avanzado está habilitado, usar el nuevo dashboard
  if (enableAdvancedMode) {
    return <PhaseDashboard />
  }
  const addPhase = () => {
    const newPhase: ProposalPhase = {
      id: crypto.randomUUID(),
      name: '',
      description: '',
      services: [],
      deliverables: [''],
      paymentPercentage: 0,
      estimatedDuration: ''
    }
    onPhasesChange([...phases, newPhase])
  }

  const removePhase = (phaseId: string) => {
    onPhasesChange(phases.filter(p => p.id !== phaseId))
  }

  const updatePhase = (phaseId: string, field: keyof ProposalPhase, value: any) => {
    onPhasesChange(phases.map(p => 
      p.id === phaseId ? { ...p, [field]: value } : p
    ))
  }

  const addService = (phaseId: string) => {
    const newService: ProposalService = {
      id: crypto.randomUUID(),
      name: '',
      description: '',
      quantity: 1,
      unitPrice: 0,
      total: 0
    }
    
    onPhasesChange(phases.map(p => 
      p.id === phaseId ? { ...p, services: [...p.services, newService] } : p
    ))
  }

  const removeService = (phaseId: string, serviceId: string) => {
    onPhasesChange(phases.map(p => 
      p.id === phaseId ? { ...p, services: p.services.filter(s => s.id !== serviceId) } : p
    ))
  }

  const updateService = (phaseId: string, serviceId: string, field: keyof ProposalService, value: any) => {
    onPhasesChange(phases.map(p => 
      p.id === phaseId ? {
        ...p,
        services: p.services.map(s => {
          if (s.id === serviceId) {
            const updatedService = { ...s, [field]: value }
            if (field === 'quantity' || field === 'unitPrice') {
              updatedService.total = updatedService.quantity * updatedService.unitPrice
            }
            return updatedService
          }
          return s
        })
      } : p
    ))
  }

  const addDeliverable = (phaseId: string) => {
    const phase = phases.find(p => p.id === phaseId)
    if (phase) {
      updatePhase(phaseId, 'deliverables', [...phase.deliverables, ''])
    }
  }

  const updateDeliverable = (phaseId: string, index: number, value: string) => {
    const phase = phases.find(p => p.id === phaseId)
    if (phase) {
      const newDeliverables = [...phase.deliverables]
      newDeliverables[index] = value
      updatePhase(phaseId, 'deliverables', newDeliverables)
    }
  }

  const removeDeliverable = (phaseId: string, index: number) => {
    const phase = phases.find(p => p.id === phaseId)
    if (phase && phase.deliverables.length > 1) {
      const newDeliverables = phase.deliverables.filter((_, i) => i !== index)
      updatePhase(phaseId, 'deliverables', newDeliverables)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <Label className="text-base font-semibold">Fases del Proyecto</Label>
          <p className="text-sm text-muted-foreground mt-1">
            Gestión básica de fases. Para funciones avanzadas, activa el modo avanzado.
          </p>
        </div>
        <div className="flex gap-2">
          <UIButton 
            variant="outline" 
            size="sm"
            onClick={() => onPhasesChange([])} // Reset to trigger advanced mode
            className="text-primary"
          >
            <TrendingUp className="h-4 w-4 mr-2" />
            Modo Avanzado
          </UIButton>
          <Button onClick={addPhase} variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Añadir Fase
          </Button>
        </div>
      </div>

      {phases.map((phase, phaseIndex) => (
        <Card key={phase.id} className="border-2">
          <CardHeader>
            <div className="flex justify-between items-start">
              <CardTitle className="text-lg">Fase {phaseIndex + 1}</CardTitle>
              <Button
                onClick={() => removePhase(phase.id)}
                variant="ghost"
                size="sm"
                disabled={phases.length === 1}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Nombre de la Fase</Label>
                <Input
                  value={phase.name}
                  onChange={(e) => updatePhase(phase.id, 'name', e.target.value)}
                  placeholder="Ej: Diagnóstico Integral"
                />
              </div>
              <div>
                <Label>Duración Estimada</Label>
                <Input
                  value={phase.estimatedDuration || ''}
                  onChange={(e) => updatePhase(phase.id, 'estimatedDuration', e.target.value)}
                  placeholder="Ej: 2-3 semanas"
                />
              </div>
            </div>

            <div>
              <Label>Descripción</Label>
              <Textarea
                value={phase.description}
                onChange={(e) => updatePhase(phase.id, 'description', e.target.value)}
                placeholder="Descripción detallada de la fase..."
                rows={3}
              />
            </div>

            <div>
              <Label>Entregables</Label>
              {phase.deliverables.map((deliverable, index) => (
                <div key={index} className="flex gap-2 mt-2">
                  <Input
                    value={deliverable}
                    onChange={(e) => updateDeliverable(phase.id, index, e.target.value)}
                    placeholder="Ej: Informe detallado de diagnóstico"
                  />
                  <Button
                    onClick={() => removeDeliverable(phase.id, index)}
                    variant="ghost"
                    size="sm"
                    disabled={phase.deliverables.length === 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                onClick={() => addDeliverable(phase.id)}
                variant="outline"
                size="sm"
                className="mt-2"
              >
                <Plus className="h-4 w-4 mr-2" />
                Añadir Entregable
              </Button>
            </div>

            <div>
              <Label>Servicios de la Fase</Label>
              {phase.services.map((service) => (
                <Card key={service.id} className="mt-2 p-4">
                  <div className="flex justify-between items-start mb-2">
                    <Label className="font-medium">Servicio</Label>
                    <Button
                      onClick={() => removeService(phase.id, service.id)}
                      variant="ghost"
                      size="sm"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    <Input
                      value={service.name}
                      onChange={(e) => updateService(phase.id, service.id, 'name', e.target.value)}
                      placeholder="Nombre del servicio"
                    />
                    <Input
                      type="number"
                      value={service.quantity}
                      onChange={(e) => updateService(phase.id, service.id, 'quantity', Number(e.target.value))}
                      placeholder="Cantidad"
                    />
                    <Input
                      type="number"
                      value={service.unitPrice}
                      onChange={(e) => updateService(phase.id, service.id, 'unitPrice', Number(e.target.value))}
                      placeholder="Precio unitario (€)"
                    />
                  </div>
                  <Textarea
                    value={service.description}
                    onChange={(e) => updateService(phase.id, service.id, 'description', e.target.value)}
                    placeholder="Descripción del servicio..."
                    className="mt-2"
                    rows={2}
                  />
                  <div className="mt-2 text-right">
                    <Label className="font-semibold">Total: {service.total.toFixed(2)} €</Label>
                  </div>
                </Card>
              ))}
              <Button
                onClick={() => addService(phase.id)}
                variant="outline"
                size="sm"
                className="mt-2"
              >
                <Plus className="h-4 w-4 mr-2" />
                Añadir Servicio
              </Button>
            </div>

            <div>
              <Label>Porcentaje de Pago (%)</Label>
              <Input
                type="number"
                min={0}
                max={100}
                value={phase.paymentPercentage}
                onChange={(e) => updatePhase(phase.id, 'paymentPercentage', Number(e.target.value))}
                placeholder="Ej: 70"
              />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
