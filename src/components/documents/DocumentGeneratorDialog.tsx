import { useState, useEffect } from 'react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Eye, Brain } from 'lucide-react'
import { useDocumentTemplates } from '@/hooks/useDocumentTemplates'
import { useCases } from '@/hooks/useCases'
import { useContacts } from '@/hooks/useContacts'
import { DocumentFormWizard } from './advanced/DocumentFormWizard'
import { AIDocumentAnalyzer } from './ai/AIDocumentAnalyzer'
import { AIContentGenerator } from './ai/AIContentGenerator'
import { DocumentGeneratorHeader } from './generator/DocumentGeneratorHeader'
import { DocumentModeSelector } from './generator/DocumentModeSelector'
import { DocumentBasicInfo } from './generator/DocumentBasicInfo'
import { DocumentVariablesForm } from './generator/DocumentVariablesForm'
import { DocumentPreview } from './generator/DocumentPreview'
import { useDocumentForm } from './generator/useDocumentForm'
import { toast } from 'sonner'

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
  
  const [preview, setPreview] = useState('')
  const [activeTab, setActiveTab] = useState('form')
  const [useAdvancedMode, setUseAdvancedMode] = useState(true)
  const [generatedDocumentId, setGeneratedDocumentId] = useState<string | null>(null)

  const template = templates.find(t => t.id === templateId)

  const {
    formData,
    errors,
    isSubmitting,
    updateFormData,
    updateVariable,
    autofillFromCase,
    autofillFromContact,
    handleSubmit: submitForm,
    resetForm
  } = useDocumentForm({
    template,
    cases,
    contacts,
    onSubmit: async (data) => {
      const result = await generateDocument.mutateAsync({
        templateId: template.id,
        title: data.title,
        variablesData: data.variables,
        caseId: data.caseId || undefined,
        contactId: data.contactId || undefined
      })
      
      if (result?.id) {
        setGeneratedDocumentId(result.id)
        toast.success('Documento generado exitosamente')
        setActiveTab('preview')
      }
      
      onOpenChange(false)
    }
  })

  // Update preview when variables change
  useEffect(() => {
    if (template) {
      let previewContent = template.template_content
      Object.entries(formData.variables).forEach(([key, value]) => {
        const regex = new RegExp(`{{${key}}}`, 'g')
        previewContent = previewContent.replace(regex, String(value) || `[${key}]`)
      })
      setPreview(previewContent)
    }
  }, [template, formData.variables])

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      resetForm()
      setPreview('')
      setActiveTab('form')
      setGeneratedDocumentId(null)
    }
  }, [open, resetForm])


  if (!template) {
    return null
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DocumentGeneratorHeader 
          templateName={template.name}
          isAiEnhanced={template.is_ai_enhanced}
        />

        <DocumentModeSelector
          useAdvancedMode={useAdvancedMode}
          onModeChange={setUseAdvancedMode}
        />

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="form">Formulario</TabsTrigger>
            <TabsTrigger value="ai-generator">IA Generador</TabsTrigger>
            <TabsTrigger value="ai-analyzer">IA Análisis</TabsTrigger>
            <TabsTrigger value="preview">Vista Previa</TabsTrigger>
          </TabsList>

          <TabsContent value="form">
            <form onSubmit={submitForm} className="space-y-6">
              <DocumentBasicInfo
                formData={formData}
                onFormDataChange={updateFormData}
                cases={cases}
                contacts={contacts}
                isAiEnhanced={template.is_ai_enhanced}
                onCaseSelect={autofillFromCase}
                onContactSelect={autofillFromContact}
              />

              {useAdvancedMode ? (
                <DocumentFormWizard
                  template={template}
                  formData={formData}
                  onDataChange={(newData) => {
                    Object.entries(newData).forEach(([key, value]) => {
                      if (key === 'variables') {
                        Object.entries(value as Record<string, any>).forEach(([varKey, varValue]) => {
                          updateVariable(varKey, varValue)
                        })
                      } else {
                        updateFormData(key, value)
                      }
                    })
                  }}
                  cases={cases}
                  contacts={contacts}
                />
              ) : (
                <DocumentVariablesForm
                  variables={template.variables}
                  formData={formData.variables}
                  onVariableChange={updateVariable}
                  errors={errors}
                />
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
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="gap-2"
                  >
                    {isSubmitting ? 'Generando...' : 'Generar Documento'}
                  </Button>
                </div>
              )}
            </form>
          </TabsContent>

          <TabsContent value="ai-generator">
            <AIContentGenerator
              documentType={template.document_type}
              templateId={template.id}
              initialVariables={formData.variables}
              onContentGenerated={(content) => {
                // Actualizar el preview con el contenido generado
                setPreview(content)
                // Opcional: cambiar a la pestaña de preview
                setActiveTab('preview')
              }}
            />
          </TabsContent>

          <TabsContent value="ai-analyzer">
            {generatedDocumentId ? (
              <AIDocumentAnalyzer
                documentId={generatedDocumentId}
                documentContent={preview}
                onContentUpdate={(newContent) => {
                  setPreview(newContent)
                }}
              />
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">Análisis IA Disponible</h3>
                <p>Genera primero el documento para acceder a las funcionalidades de análisis IA</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="preview">
            <DocumentPreview
              content={preview}
              title={formData.title}
              templateName={template.name}
              variables={formData.variables}
              onEdit={() => setActiveTab('form')}
              onGenerate={submitForm}
              isGenerating={isSubmitting}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}