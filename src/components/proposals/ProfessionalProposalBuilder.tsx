
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
import { ProposalTemplateSelector, ProposalStyle, BuiltInTemplate } from './ProposalTemplateSelector'
import { ProposalPreviewFormal } from './previews/ProposalPreviewFormal'
import { ProposalPreviewVisual } from './previews/ProposalPreviewVisual'
import { toast } from 'sonner'

interface ProfessionalProposalBuilderProps {
  onBack: () => void
}

export const ProfessionalProposalBuilder: React.FC<ProfessionalProposalBuilderProps> = ({ onBack }) => {
  const { clients } = useClients()
  const { saveProposal, isSaving } = useProposalProfessional()
  const [proposalStyle, setProposalStyle] = useState<ProposalStyle>('formal')

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

  const handleLoadTemplate = (template: BuiltInTemplate) => {
    const d = template.defaults
    setFormData(prev => ({
      ...prev,
      companyName: d.companyName ?? prev.companyName,
      companyDescription: d.companyDescription ?? prev.companyDescription,
      introduction: d.introduction ?? prev.introduction,
      validityDays: d.validityDays ?? prev.validityDays,
      paymentTerms: d.paymentTerms ?? prev.paymentTerms,
      confidentialityClause: d.confidentialityClause ?? prev.confidentialityClause,
      expensesIncluded: d.expensesIncluded ?? prev.expensesIncluded,
      iva: d.iva ?? prev.iva,
      phases: d.phases ?? prev.phases,
      team: d.team ?? prev.team,
    }))
    setProposalStyle(template.style)
    toast.success(`Plantilla "${template.name}" cargada`)
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

  return (
    <div className="max-w-7xl mx-auto py-6">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver a Propuestas
        </Button>
        <h1 className="text-2xl font-bold">Constructor de Propuesta Profesional</h1>
      </div>

      <Tabs defaultValue="style" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="style">Estilo</TabsTrigger>
          <TabsTrigger value="basic">Información Básica</TabsTrigger>
          <TabsTrigger value="phases">Fases y Servicios</TabsTrigger>
          <TabsTrigger value="team">Equipo</TabsTrigger>
          <TabsTrigger value="terms">Términos</TabsTrigger>
          <TabsTrigger value="preview">Vista Previa</TabsTrigger>
        </TabsList>

        <TabsContent value="style" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Estilo y Plantilla</CardTitle>
            </CardHeader>
            <CardContent>
              <ProposalTemplateSelector
                selectedStyle={proposalStyle}
                onSelectTemplate={handleLoadTemplate}
                onStyleChange={setProposalStyle}
              />
            </CardContent>
          </Card>
        </TabsContent>

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

              <div className="bg-muted p-4 rounded-lg">
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
                Vista Previa — Estilo {proposalStyle === 'formal' ? 'Formal' : 'Visual'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px] w-full border rounded-md">
                {proposalStyle === 'formal' ? (
                  <ProposalPreviewFormal
                    formData={formData}
                    clientName={selectedClient?.name}
                    totals={totals}
                  />
                ) : (
                  <ProposalPreviewVisual
                    formData={formData}
                    clientName={selectedClient?.name}
                    totals={totals}
                  />
                )}
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
