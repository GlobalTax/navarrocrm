import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { FileText, Eye, Download, Send, Bot, Zap, Clock, MessageSquare, Share, Activity } from 'lucide-react'
import { useDocumentTemplates } from '@/hooks/useDocumentTemplates'
import { useCases } from '@/hooks/useCases'
import { useContacts } from '@/hooks/useContacts'
import { DocumentFormWizard } from './advanced/DocumentFormWizard'
import { DocumentVersionHistory } from './collaboration/DocumentVersionHistory'
import { DocumentComments } from './collaboration/DocumentComments'
import { DocumentCompare } from './collaboration/DocumentCompare'
import { DocumentActivity } from './collaboration/DocumentActivity'
import { DocumentVersion } from '@/hooks/useDocumentCollaboration'

interface DocumentGeneratorDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  templateId: string
}

export const DocumentGeneratorDialog = ({
  open,
  onOpenChange,
  templateId
}: DocumentGeneratorDialogProps) => {
  const { templates, generateDocument } = useDocumentTemplates()
  const { cases } = useCases()
  const { contacts } = useContacts()
  
  const [formData, setFormData] = useState({
    title: '',
    variables: {} as Record<string, any>,
    caseId: '',
    contactId: '',
    useAI: false
  })
  
  const [preview, setPreview] = useState('')
  const [activeTab, setActiveTab] = useState('form')
  const [useAdvancedMode, setUseAdvancedMode] = useState(true)
  const [compareVersions, setCompareVersions] = useState<{ version1: DocumentVersion; version2: DocumentVersion } | null>(null)
  const [generatedDocumentId, setGeneratedDocumentId] = useState<string | null>(null)

  const template = templates.find(t => t.id === templateId)

  useEffect(() => {
    if (template) {
      // Inicializar variables con valores por defecto
      const initialVariables: Record<string, any> = {}
      template.variables.forEach(variable => {
        initialVariables[variable.name] = variable.default || ''
      })
      
      setFormData(prev => ({
        ...prev,
        title: `${template.name} - ${new Date().toLocaleDateString()}`,
        variables: initialVariables
      }))
    }
  }, [template])

  useEffect(() => {
    if (template) {
      // Generar preview
      let previewContent = template.template_content
      Object.entries(formData.variables).forEach(([key, value]) => {
        const regex = new RegExp(`{{${key}}}`, 'g')
        previewContent = previewContent.replace(regex, String(value) || `[${key}]`)
      })
      setPreview(previewContent)
    }
  }, [template, formData.variables])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!template) return

    await generateDocument.mutateAsync({
      templateId: template.id,
      title: formData.title,
      variablesData: formData.variables,
      caseId: formData.caseId || undefined,
      contactId: formData.contactId || undefined
    })
    
    onOpenChange(false)
    // Reset form
    setFormData({
      title: '',
      variables: {},
      caseId: '',
      contactId: '',
      useAI: false
    })
  }

  const handleVariableChange = (variableName: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      variables: {
        ...prev.variables,
        [variableName]: value
      }
    }))
  }

  const autofillFromCase = (caseId: string) => {
    const selectedCase = cases.find(c => c.id === caseId)
    if (selectedCase) {
      // Autofill common variables from case data
      const updates: Record<string, any> = {}
      template?.variables.forEach(variable => {
        switch (variable.name) {
          case 'nombre_cliente':
          case 'cliente':
            if (selectedCase.contact_id) {
              const contact = contacts.find(c => c.id === selectedCase.contact_id)
              if (contact) updates[variable.name] = contact.name
            }
            break
          case 'materia_legal':
          case 'materia':
            updates[variable.name] = selectedCase.practice_area || ''
            break
          case 'fecha_contrato':
          case 'fecha':
            updates[variable.name] = new Date().toISOString().split('T')[0]
            break
          case 'ciudad':
          case 'lugar':
            updates[variable.name] = 'Madrid' // Default
            break
        }
      })
      
      setFormData(prev => ({
        ...prev,
        variables: { ...prev.variables, ...updates }
      }))
    }
  }

  const autofillFromContact = (contactId: string) => {
    const selectedContact = contacts.find(c => c.id === contactId)
    if (selectedContact) {
      const updates: Record<string, any> = {}
      template?.variables.forEach(variable => {
        switch (variable.name) {
          case 'nombre_cliente':
          case 'cliente':
          case 'nombre_destinatario':
            updates[variable.name] = selectedContact.name
            break
          case 'dni_cliente':
          case 'dni':
            updates[variable.name] = selectedContact.dni_nif || ''
            break
          case 'direccion_cliente':
          case 'direccion':
            updates[variable.name] = selectedContact.address_street || ''
            break
          case 'email_cliente':
          case 'email':
            updates[variable.name] = selectedContact.email || ''
            break
        }
      })
      
      setFormData(prev => ({
        ...prev,
        variables: { ...prev.variables, ...updates }
      }))
    }
  }

  if (!template) {
    return null
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Generar: {template.name}
            {template.is_ai_enhanced && <Bot className="h-4 w-4 text-primary" />}
          </DialogTitle>
        </DialogHeader>

        {/* Mode selector */}
        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="advanced_mode"
              checked={useAdvancedMode}
              onCheckedChange={setUseAdvancedMode}
            />
            <Label htmlFor="advanced_mode" className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Modo Avanzado
            </Label>
          </div>
          <span className="text-sm text-muted-foreground">
            {useAdvancedMode ? 'Asistente paso a paso con validación' : 'Formulario tradicional'}
          </span>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="form">Formulario</TabsTrigger>
            <TabsTrigger value="preview">Vista Previa</TabsTrigger>
          </TabsList>

          <TabsContent value="form">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Información básica */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Información del Documento</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Título del Documento</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="case">Expediente (Opcional)</Label>
                      <Select
                        value={formData.caseId}
                        onValueChange={(value) => {
                          setFormData(prev => ({ ...prev, caseId: value }))
                          autofillFromCase(value)
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar expediente" />
                        </SelectTrigger>
                        <SelectContent>
                          {cases.map((case_) => (
                            <SelectItem key={case_.id} value={case_.id}>
                              {case_.matter_number} - {case_.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="contact">Cliente (Opcional)</Label>
                      <Select
                        value={formData.contactId}
                        onValueChange={(value) => {
                          setFormData(prev => ({ ...prev, contactId: value }))
                          autofillFromContact(value)
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar cliente" />
                        </SelectTrigger>
                        <SelectContent>
                          {contacts.map((contact) => (
                            <SelectItem key={contact.id} value={contact.id}>
                              {contact.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {template.is_ai_enhanced && (
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="use_ai"
                        checked={formData.useAI}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, useAI: checked }))}
                      />
                      <Label htmlFor="use_ai" className="flex items-center gap-2">
                        <Bot className="h-4 w-4" />
                        Usar IA para mejorar el contenido
                      </Label>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Advanced or traditional form */}
              {useAdvancedMode ? (
                <DocumentFormWizard
                  template={template}
                  formData={formData}
                  onDataChange={setFormData}
                  cases={cases}
                  contacts={contacts}
                />
              ) : (
                /* Traditional form */
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Variables del Documento</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {template.variables.map((variable) => (
                        <div key={variable.name} className="space-y-2">
                          <Label htmlFor={variable.name}>
                            {variable.label}
                            {variable.required && <span className="text-destructive">*</span>}
                          </Label>
                          
                          {variable.type === 'text' && (
                            <Input
                              id={variable.name}
                              value={formData.variables[variable.name] || ''}
                              onChange={(e) => handleVariableChange(variable.name, e.target.value)}
                              required={variable.required}
                            />
                          )}
                          
                          {variable.type === 'number' && (
                            <Input
                              id={variable.name}
                              type="number"
                              value={formData.variables[variable.name] || ''}
                              onChange={(e) => handleVariableChange(variable.name, e.target.value)}
                              required={variable.required}
                            />
                          )}
                          
                          {variable.type === 'date' && (
                            <Input
                              id={variable.name}
                              type="date"
                              value={formData.variables[variable.name] || ''}
                              onChange={(e) => handleVariableChange(variable.name, e.target.value)}
                              required={variable.required}
                            />
                          )}
                          
                          {variable.type === 'boolean' && (
                            <Switch
                              checked={formData.variables[variable.name] || false}
                              onCheckedChange={(checked) => handleVariableChange(variable.name, checked)}
                            />
                          )}

                          {variable.type === 'select' && (
                            <Select
                              value={formData.variables[variable.name] || ''}
                              onValueChange={(value) => handleVariableChange(variable.name, value)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder={`Seleccionar ${variable.label.toLowerCase()}`} />
                              </SelectTrigger>
                              <SelectContent>
                                {variable.options?.map((option) => (
                                  <SelectItem key={option} value={option}>
                                    {option}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {!useAdvancedMode && (
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                    Cancelar
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setActiveTab('preview')}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Vista Previa
                  </Button>
                  <Button type="submit" disabled={generateDocument.isPending}>
                    {generateDocument.isPending ? 'Generando...' : 'Generar Documento'}
                  </Button>
                </div>
              )}
            </form>
          </TabsContent>

          <TabsContent value="preview">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Vista Previa del Documento</span>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Descargar PDF
                    </Button>
                    <Button variant="outline" size="sm">
                      <Send className="h-4 w-4 mr-2" />
                      Enviar por Email
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-white border rounded-lg p-6 max-h-96 overflow-y-auto">
                  <pre className="whitespace-pre-wrap font-serif text-sm leading-relaxed">
                    {preview}
                  </pre>
                </div>
                
                <div className="flex justify-end gap-2 mt-4">
                  <Button
                    variant="outline"
                    onClick={() => setActiveTab('form')}
                  >
                    Volver al Formulario
                  </Button>
                  <Button onClick={handleSubmit} disabled={generateDocument.isPending}>
                    {generateDocument.isPending ? 'Generando...' : 'Generar Documento'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}