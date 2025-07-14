import { useState, useEffect } from 'react'
import { FileText, Download, PenTool, Check, Clock, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { toast } from 'sonner'

interface OnboardingDocument {
  id: string
  document_name: string
  content: string
  pdf_url?: string
  status: string
  requires_signature: boolean
  signature_data?: any
  signed_at?: string
  template: {
    name: string
    document_type: string
    description?: string
  }
}

interface DocumentSigningStepProps {
  onboardingId: string
  onAllDocumentsSigned: () => void
}

export const DocumentSigningStep = ({ onboardingId, onAllDocumentsSigned }: DocumentSigningStepProps) => {
  const queryClient = useQueryClient()
  const [selectedDocument, setSelectedDocument] = useState<OnboardingDocument | null>(null)
  const [isSigningDialog, setIsSigningDialog] = useState(false)
  const [signatureText, setSignatureText] = useState('')
  const [isGeneratingPdf, setIsGeneratingPdf] = useState<string | null>(null)

  const { data: documents = [], isLoading } = useQuery({
    queryKey: ['onboarding-documents', onboardingId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employee_onboarding_documents')
        .select(`
          *,
          template:employee_document_templates(name, document_type, description)
        `)
        .eq('onboarding_id', onboardingId)
        .order('created_at', { ascending: true })
      
      if (error) throw error
      return data as OnboardingDocument[]
    },
    enabled: !!onboardingId
  })

  const generatePdfMutation = useMutation({
    mutationFn: async (documentId: string) => {
      const { data, error } = await supabase.functions.invoke('generate-document-pdf', {
        body: { documentId }
      })
      
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['onboarding-documents'] })
      toast.success('PDF generado exitosamente')
    },
    onError: (error: any) => {
      toast.error('Error al generar PDF', {
        description: error.message
      })
    },
    onSettled: () => {
      setIsGeneratingPdf(null)
    }
  })

  const signDocumentMutation = useMutation({
    mutationFn: async ({ documentId, signature }: { documentId: string, signature: string }) => {
      const { data, error } = await supabase.functions.invoke('sign-document', {
        body: { 
          documentId, 
          signature,
          signedAt: new Date().toISOString()
        }
      })
      
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['onboarding-documents'] })
      setIsSigningDialog(false)
      setSignatureText('')
      setSelectedDocument(null)
      toast.success('Documento firmado exitosamente')
    },
    onError: (error: any) => {
      toast.error('Error al firmar documento', {
        description: error.message
      })
    }
  })

  useEffect(() => {
    if (documents.length > 0) {
      const pendingDocs = documents.filter(doc => doc.requires_signature && doc.status !== 'signed')
      if (pendingDocs.length === 0) {
        onAllDocumentsSigned()
      }
    }
  }, [documents, onAllDocumentsSigned])

  const handleGeneratePdf = (documentId: string) => {
    setIsGeneratingPdf(documentId)
    generatePdfMutation.mutate(documentId)
  }

  const handleSignDocument = (document: OnboardingDocument) => {
    setSelectedDocument(document)
    setIsSigningDialog(true)
  }

  const handleSubmitSignature = () => {
    if (!selectedDocument || !signatureText.trim()) return
    
    signDocumentMutation.mutate({
      documentId: selectedDocument.id,
      signature: signatureText.trim()
    })
  }

  const getStatusIcon = (status: string, requiresSignature: boolean) => {
    if (status === 'signed') return <Check className="h-4 w-4 text-green-600" />
    if (requiresSignature && status === 'pending') return <PenTool className="h-4 w-4 text-orange-600" />
    if (status === 'completed') return <Check className="h-4 w-4 text-green-600" />
    return <Clock className="h-4 w-4 text-muted-foreground" />
  }

  const getStatusText = (status: string, requiresSignature: boolean) => {
    if (status === 'signed') return 'Firmado'
    if (requiresSignature && status === 'pending') return 'Pendiente de Firma'
    if (status === 'completed') return 'Completado'
    return 'Pendiente'
  }

  const getStatusVariant = (status: string, requiresSignature: boolean): "default" | "secondary" | "destructive" | "outline" => {
    if (status === 'signed' || status === 'completed') return 'default'
    if (requiresSignature && status === 'pending') return 'secondary'
    return 'outline'
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="h-20 bg-muted rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold mb-2">Documentos para Firmar</h2>
        <p className="text-muted-foreground">
          Revisa y firma los documentos necesarios para completar tu incorporación
        </p>
      </div>

      <div className="space-y-4">
        {documents.map((document) => (
          <Card key={document.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <FileText className="h-5 w-5 mt-0.5 text-muted-foreground" />
                  <div>
                    <CardTitle className="text-base">{document.document_name}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {document.template.description || document.template.document_type}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(document.status, document.requires_signature)}
                  <Badge variant={getStatusVariant(document.status, document.requires_signature)}>
                    {getStatusText(document.status, document.requires_signature)}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedDocument(document)}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Ver Documento
                </Button>

                {document.pdf_url ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(document.pdf_url, '_blank')}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Descargar PDF
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleGeneratePdf(document.id)}
                    disabled={isGeneratingPdf === document.id}
                  >
                    {isGeneratingPdf === document.id ? (
                      <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    ) : (
                      <Download className="h-4 w-4 mr-2" />
                    )}
                    Generar PDF
                  </Button>
                )}

                {document.requires_signature && document.status !== 'signed' && (
                  <Button
                    size="sm"
                    onClick={() => handleSignDocument(document)}
                  >
                    <PenTool className="h-4 w-4 mr-2" />
                    Firmar Documento
                  </Button>
                )}
              </div>

              {document.signed_at && (
                <div className="mt-3 pt-3 border-t">
                  <p className="text-xs text-muted-foreground">
                    Firmado el {new Date(document.signed_at).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {documents.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">No hay documentos disponibles</h3>
            <p className="text-muted-foreground">
              Los documentos se generarán automáticamente una vez que completes los pasos anteriores
            </p>
          </CardContent>
        </Card>
      )}

      {/* Document Viewer Dialog */}
      <Dialog open={!!selectedDocument && !isSigningDialog} onOpenChange={() => setSelectedDocument(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedDocument?.document_name}</DialogTitle>
          </DialogHeader>
          {selectedDocument && (
            <div className="space-y-4">
              <div 
                className="border rounded-lg p-4 bg-background min-h-[400px]"
                dangerouslySetInnerHTML={{ __html: selectedDocument.content }}
              />
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setSelectedDocument(null)}>
                  Cerrar
                </Button>
                {selectedDocument.requires_signature && selectedDocument.status !== 'signed' && (
                  <Button onClick={() => handleSignDocument(selectedDocument)}>
                    <PenTool className="h-4 w-4 mr-2" />
                    Firmar Documento
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Signing Dialog */}
      <Dialog open={isSigningDialog} onOpenChange={setIsSigningDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Firmar Documento</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-4">
                Para firmar el documento "{selectedDocument?.document_name}", escribe tu nombre completo como firma digital.
              </p>
              
              <Label htmlFor="signature">Firma Digital *</Label>
              <Input
                id="signature"
                value={signatureText}
                onChange={(e) => setSignatureText(e.target.value)}
                placeholder="Escribe tu nombre completo"
                className="mt-1"
              />
            </div>

            <Separator />

            <div className="bg-muted/30 p-3 rounded-lg">
              <p className="text-xs text-muted-foreground">
                Al firmar este documento, confirmas que has leído y aceptas su contenido. 
                Esta firma digital tiene la misma validez legal que una firma manuscrita.
              </p>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsSigningDialog(false)}>
                Cancelar
              </Button>
              <Button 
                onClick={handleSubmitSignature}
                disabled={!signatureText.trim() || signDocumentMutation.isPending}
              >
                {signDocumentMutation.isPending ? (
                  <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                ) : (
                  <PenTool className="h-4 w-4 mr-2" />
                )}
                Confirmar Firma
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}