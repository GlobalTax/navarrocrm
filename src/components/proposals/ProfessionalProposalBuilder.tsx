
import React, { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ArrowLeft, Save, FileText } from 'lucide-react'
import { useClients } from '@/hooks/useClients'
import { useProposalProfessional, ProposalData, ProposalPhase, ProposalTeamMember } from '@/hooks/useProposalProfessional'
import { PhaseManager } from './PhaseManager'
import { TeamManager } from './TeamManager'

interface ProfessionalProposalBuilderProps {
  onBack: () => void
}

export const ProfessionalProposalBuilder: React.FC<ProfessionalProposalBuilderProps> = ({ onBack }) => {
  const { clients } = useClients()
  const { saveProposal, isSaving } = useProposalProfessional()

  const [formData, setFormData] = useState<ProposalData>({
    title: '',
    clientId: '',
    projectReference: '',
    companyName: 'Navarro Legal y Tributario',
    companyDescription: 'Firma de profesionales especializada en asesoramiento fiscal y mercantil en operaciones corporativas, M&A, reestructuraciones empresariales y planificación patrimonial.',
    introduction: '',
    phases: [{
      id: crypto.randomUUID(),
      name: 'Diagnóstico Integral',
      description: '',
      services: [],
      deliverables: ['Informe detallado de diagnóstico'],
      paymentPercentage: 70,
      estimatedDuration: '2-3 semanas'
    }],
    team: [{
      id: crypto.randomUUID(),
      name: '',
      role: 'Socio Coordinador',
      experience: ''
    }],
    validityDays: 60,
    paymentTerms: '70% al aceptar el encargo y 30% al completar la fase',
    confidentialityClause: true,
    expensesIncluded: false,
    subtotal: 0,
    expenses: 0,
    iva: 21,
    total: 0
  })

  const selectedClient = clients.find(c => c.id === formData.clientId)

  const totals = useMemo(() => {
    const subtotal = formData.phases.reduce((total, phase) => 
      total + phase.services.reduce((phaseTotal, service) => phaseTotal + service.total, 0), 0
    )
    const ivaAmount = (subtotal * formData.iva) / 100
    const total = subtotal + ivaAmount + formData.expenses

    return { subtotal, ivaAmount, total }
  }, [formData.phases, formData.iva, formData.expenses])

  const updateFormData = (field: keyof ProposalData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    if (!formData.clientId || !formData.title || formData.phases.length === 0) {
      return
    }

    const dataToSave = {
      ...formData,
      subtotal: totals.subtotal,
      total: totals.total
    }

    try {
      await saveProposal(dataToSave)
      onBack()
    } catch (error) {
      console.error('Error saving proposal:', error)
    }
  }

  const generatePreview = () => {
    const today = new Date().toLocaleDateString('es-ES', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })

    return (
      <div className="max-w-4xl mx-auto p-8 bg-white text-black">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold mb-2">PROPUESTA DE HONORARIOS PROFESIONALES</h1>
          <p className="text-sm text-gray-600">
            En Barcelona, a {today}
          </p>
          {selectedClient && (
            <p className="text-sm text-gray-600 mt-2">
              Re: {selectedClient.name}
            </p>
          )}
          {formData.projectReference && (
            <p className="text-sm text-gray-600">
              Ref.: {formData.projectReference}
            </p>
          )}
        </div>

        <div className="mb-6">
          <p>Estimado {selectedClient?.name?.split(' ')[0] || 'Cliente'}:</p>
          <p className="mt-4 text-justify">
            {formData.introduction || 'De acuerdo con nuestra reciente reunión y su solicitud de colaboración, tenemos el gusto de remitirles la presente propuesta de servicios profesionales.'}
          </p>
        </div>

        <div className="mb-6">
          <h2 className="text-lg font-bold mb-3">1. Información General sobre {formData.companyName}</h2>
          <p className="text-justify">
            {formData.companyDescription}
          </p>
        </div>

        <div className="mb-6">
          <h2 className="text-lg font-bold mb-3">2. Alcance de Nuestra Colaboración</h2>
          <p className="mb-4">
            Nuestra colaboración se estructurará por fases, permitiendo un enfoque modular y adaptado al progreso del proyecto:
          </p>
          
          {formData.phases.map((phase, index) => (
            <div key={phase.id} className="mb-6">
              <h3 className="font-semibold mb-2">
                Fase {index + 1} – {phase.name}
                {phase.estimatedDuration && ` (${phase.estimatedDuration})`}
              </h3>
              <p className="mb-3 text-justify">{phase.description}</p>
              
              {phase.deliverables.length > 0 && (
                <div className="mb-3">
                  <p className="font-medium">Entregables:</p>
                  <ul className="list-disc list-inside ml-4">
                    {phase.deliverables.map((deliverable, idx) => (
                      <li key={idx}>{deliverable}</li>
                    ))}
                  </ul>
                </div>
              )}

              {phase.services.length > 0 && (
                <div className="mb-3">
                  <p className="font-medium">Servicios incluidos:</p>
                  <ul className="list-disc list-inside ml-4">
                    {phase.services.map((service) => (
                      <li key={service.id}>
                        {service.name}: {service.description}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <p className="text-sm">
                <strong>Honorarios estimados:</strong> {
                  phase.services.reduce((total, service) => total + service.total, 0).toFixed(2)
                } € ({phase.paymentPercentage}% al inicio, {100 - phase.paymentPercentage}% al completar)
              </p>
            </div>
          ))}
        </div>

        {formData.team.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-bold mb-3">3. Equipo Responsable</h2>
            <p className="mb-3">
              Para la prestación de estos servicios {formData.companyName} asignará un equipo multidisciplinar:
            </p>
            <ul className="list-disc list-inside ml-4">
              {formData.team.map((member) => (
                <li key={member.id} className="mb-2">
                  <strong>{member.role}:</strong> {member.name}
                  {member.experience && `, ${member.experience}`}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mb-6">
          <h2 className="text-lg font-bold mb-3">4. Honorarios Profesionales</h2>
          <table className="w-full border border-gray-300 mb-4">
            <thead className="bg-gray-100">
              <tr>
                <th className="border border-gray-300 p-2 text-left">Fase</th>
                <th className="border border-gray-300 p-2 text-right">Importe</th>
                <th className="border border-gray-300 p-2 text-left">Condiciones de Pago</th>
              </tr>
            </thead>
            <tbody>
              {formData.phases.map((phase, index) => {
                const phaseTotal = phase.services.reduce((total, service) => total + service.total, 0)
                return (
                  <tr key={phase.id}>
                    <td className="border border-gray-300 p-2">Fase {index + 1} - {phase.name}</td>
                    <td className="border border-gray-300 p-2 text-right">{phaseTotal.toFixed(2)} €</td>
                    <td className="border border-gray-300 p-2">
                      {phase.paymentPercentage}% inicio, {100 - phase.paymentPercentage}% finalización
                    </td>
                  </tr>
                )
              })}
              <tr className="bg-gray-50 font-semibold">
                <td className="border border-gray-300 p-2">SUBTOTAL</td>
                <td className="border border-gray-300 p-2 text-right">{totals.subtotal.toFixed(2)} €</td>
                <td className="border border-gray-300 p-2">-</td>
              </tr>
              <tr>
                <td className="border border-gray-300 p-2">IVA ({formData.iva}%)</td>
                <td className="border border-gray-300 p-2 text-right">{totals.ivaAmount.toFixed(2)} €</td>
                <td className="border border-gray-300 p-2">-</td>
              </tr>
              <tr className="bg-gray-100 font-bold">
                <td className="border border-gray-300 p-2">TOTAL</td>
                <td className="border border-gray-300 p-2 text-right">{totals.total.toFixed(2)} €</td>
                <td className="border border-gray-300 p-2">-</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mb-6">
          <h2 className="text-lg font-bold mb-3">5. Gastos y Suplidos</h2>
          <p className="text-justify">
            {formData.expensesIncluded 
              ? "Los gastos y suplidos están incluidos en los honorarios anteriores."
              : "Los gastos y suplidos (aranceles notariales, registrales, tasas, etc.) no están incluidos en los honorarios y correrán a cargo del cliente, previa justificación."
            }
          </p>
        </div>

        {formData.confidentialityClause && (
          <div className="mb-6">
            <h2 className="text-lg font-bold mb-3">6. Confidencialidad</h2>
            <p className="text-justify">
              {formData.companyName} se compromete a mantener la más estricta confidencialidad sobre toda la información y documentación facilitada, de conformidad con la normativa aplicable y nuestro código deontológico.
            </p>
          </div>
        )}

        <div className="mb-6">
          <h2 className="text-lg font-bold mb-3">7. Duración y Modificación</h2>
          <p className="text-justify">
            La presente Propuesta tendrá una validez de {formData.validityDays} días desde la fecha de emisión. 
            La colaboración se iniciará formalmente tras la recepción de una copia de esta Propuesta debidamente firmada.
          </p>
        </div>

        <div className="mt-8 text-center">
          <p>Reciban un cordial saludo,</p>
          <p className="mt-4 font-semibold">{formData.companyName}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto py-6">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver a Propuestas
        </Button>
        <h1 className="text-2xl font-bold">Constructor de Propuesta Profesional</h1>
      </div>

      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="basic">Información Básica</TabsTrigger>
          <TabsTrigger value="phases">Fases y Servicios</TabsTrigger>
          <TabsTrigger value="team">Equipo</TabsTrigger>
          <TabsTrigger value="terms">Términos</TabsTrigger>
          <TabsTrigger value="preview">Vista Previa</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Información General</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Título de la Propuesta</Label>
                  <Input
                    value={formData.title}
                    onChange={(e) => updateFormData('title', e.target.value)}
                    placeholder="Ej: Propuesta de Servicios Legales"
                  />
                </div>
                <div>
                  <Label>Cliente</Label>
                  <Select value={formData.clientId} onValueChange={(value) => updateFormData('clientId', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar cliente" />
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

              <div>
                <Label>Referencia del Proyecto</Label>
                <Input
                  value={formData.projectReference}
                  onChange={(e) => updateFormData('projectReference', e.target.value)}
                  placeholder="Ej: Proyecto Tarragona Sol, S.L. & Holding Industrial"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Nombre de la Empresa</Label>
                  <Input
                    value={formData.companyName}
                    onChange={(e) => updateFormData('companyName', e.target.value)}
                    placeholder="Nombre de su empresa/despacho"
                  />
                </div>
                <div>
                  <Label>IVA (%)</Label>
                  <Input
                    type="number"
                    value={formData.iva}
                    onChange={(e) => updateFormData('iva', Number(e.target.value))}
                    placeholder="21"
                  />
                </div>
              </div>

              <div>
                <Label>Descripción de la Empresa</Label>
                <Textarea
                  value={formData.companyDescription}
                  onChange={(e) => updateFormData('companyDescription', e.target.value)}
                  placeholder="Breve descripción de su empresa y especialización..."
                  rows={3}
                />
              </div>

              <div>
                <Label>Introducción de la Propuesta</Label>
                <Textarea
                  value={formData.introduction}
                  onChange={(e) => updateFormData('introduction', e.target.value)}
                  placeholder="Texto introductorio de la propuesta..."
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="phases">
          <Card>
            <CardHeader>
              <CardTitle>Fases y Servicios del Proyecto</CardTitle>
            </CardHeader>
            <CardContent>
              <PhaseManager
                phases={formData.phases}
                onPhasesChange={(phases) => updateFormData('phases', phases)}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="team">
          <Card>
            <CardHeader>
              <CardTitle>Equipo Responsable</CardTitle>
            </CardHeader>
            <CardContent>
              <TeamManager
                team={formData.team}
                onTeamChange={(team) => updateFormData('team', team)}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="terms" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Términos y Condiciones</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Validez de la Propuesta (días)</Label>
                  <Input
                    type="number"
                    value={formData.validityDays}
                    onChange={(e) => updateFormData('validityDays', Number(e.target.value))}
                    placeholder="60"
                  />
                </div>
                <div>
                  <Label>Gastos Adicionales (€)</Label>
                  <Input
                    type="number"
                    value={formData.expenses}
                    onChange={(e) => updateFormData('expenses', Number(e.target.value))}
                    placeholder="0"
                  />
                </div>
              </div>

              <div>
                <Label>Términos de Pago</Label>
                <Textarea
                  value={formData.paymentTerms}
                  onChange={(e) => updateFormData('paymentTerms', e.target.value)}
                  placeholder="Condiciones específicas de pago..."
                  rows={3}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="confidentiality"
                  checked={formData.confidentialityClause}
                  onCheckedChange={(checked) => updateFormData('confidentialityClause', checked)}
                />
                <Label htmlFor="confidentiality">Incluir cláusula de confidencialidad</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="expenses"
                  checked={formData.expensesIncluded}
                  onCheckedChange={(checked) => updateFormData('expensesIncluded', checked)}
                />
                <Label htmlFor="expenses">Gastos y suplidos incluidos en honorarios</Label>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Resumen Financiero</h3>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Subtotal servicios:</span>
                    <span>{totals.subtotal.toFixed(2)} €</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Gastos adicionales:</span>
                    <span>{formData.expenses.toFixed(2)} €</span>
                  </div>
                  <div className="flex justify-between">
                    <span>IVA ({formData.iva}%):</span>
                    <span>{totals.ivaAmount.toFixed(2)} €</span>
                  </div>
                  <div className="flex justify-between font-bold border-t pt-1">
                    <span>Total:</span>
                    <span>{totals.total.toFixed(2)} €</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preview">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Vista Previa de la Propuesta
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96 w-full border rounded-md p-4">
                {generatePreview()}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-4 mt-6">
        <Button
          onClick={handleSave}
          disabled={!formData.clientId || !formData.title || formData.phases.length === 0 || isSaving}
          className="flex items-center gap-2"
        >
          {isSaving ? (
            <>
              <Save className="h-4 w-4 animate-spin" />
              Guardando...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Guardar Propuesta
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
