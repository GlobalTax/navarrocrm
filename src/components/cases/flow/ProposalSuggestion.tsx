import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { 
  FileText, 
  Plus, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  ExternalLink 
} from 'lucide-react'
import { Case } from '@/features/cases'
import { CaseFlowStatus } from '@/hooks/useCaseFlow'

interface ProposalSuggestionProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  case_: Case
  existingProposals: any[]
  flowStatus: CaseFlowStatus
}

export const ProposalSuggestion = ({ 
  open, 
  onOpenChange, 
  case_, 
  existingProposals, 
  flowStatus 
}: ProposalSuggestionProps) => {
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'won':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'lost':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'draft':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'won': return 'Ganada'
      case 'pending': return 'Pendiente'
      case 'lost': return 'Perdida'
      case 'draft': return 'Borrador'
      default: return status
    }
  }

  const handleCreateProposal = () => {
    // Redirigir a creación de propuesta con el caso preseleccionado
    window.location.href = `/proposals/new?case_id=${case_.id}&contact_id=${case_.contact_id}`
  }

  const handleViewProposal = (proposalId: string) => {
    window.location.href = `/proposals/${proposalId}`
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Propuestas - {case_.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Estado actual */}
          <Card className="border-[0.5px] border-black rounded-[10px]">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {!flowStatus.hasProposal ? (
                    <>
                      <AlertCircle className="h-5 w-5 text-orange-500" />
                      <div>
                        <div className="font-medium">Sin propuesta</div>
                        <div className="text-sm text-muted-foreground">
                          Crea una propuesta para comenzar el proceso de facturación
                        </div>
                      </div>
                    </>
                  ) : flowStatus.hasAcceptedProposal ? (
                    <>
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <div>
                        <div className="font-medium">Propuesta aceptada</div>
                        <div className="text-sm text-muted-foreground">
                          Listo para facturar y registrar tiempo
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <Clock className="h-5 w-5 text-yellow-500" />
                      <div>
                        <div className="font-medium">Propuesta pendiente</div>
                        <div className="text-sm text-muted-foreground">
                          Esperando respuesta del cliente
                        </div>
                      </div>
                    </>
                  )}
                </div>
                
                {!flowStatus.hasProposal && (
                  <Button onClick={handleCreateProposal} className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Nueva Propuesta
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Lista de propuestas existentes */}
          {existingProposals.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">Propuestas del Cliente</h3>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleCreateProposal}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Nueva
                </Button>
              </div>
              
              <div className="space-y-2">
                {existingProposals.map((proposal) => (
                  <Card 
                    key={proposal.id} 
                    className="border-[0.5px] border-gray-300 rounded-[10px] hover:shadow-md transition-shadow"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-3">
                            <span className="font-medium">{proposal.proposal_number}</span>
                            <Badge 
                              variant="outline" 
                              className={`border-[0.5px] rounded-[10px] ${getStatusColor(proposal.status)}`}
                            >
                              {getStatusLabel(proposal.status)}
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {proposal.title || 'Sin título'}
                          </div>
                          <div className="text-sm font-medium">
                            €{proposal.total_amount?.toLocaleString() || '0'}
                          </div>
                        </div>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewProposal(proposal.id)}
                          className="flex items-center gap-2"
                        >
                          <ExternalLink className="h-4 w-4" />
                          Ver
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Sugerencias según el estado */}
          <Card className="bg-blue-50 border-blue-200 rounded-[10px]">
            <CardContent className="p-4">
              <h4 className="font-medium text-blue-900 mb-2">💡 Sugerencias</h4>
              <div className="text-sm text-blue-800 space-y-1">
                {!flowStatus.hasProposal ? (
                  <>
                    <p>• Crea una propuesta con los servicios a ofrecer</p>
                    <p>• Incluye tarifas por hora o precio fijo según el caso</p>
                    <p>• Considera agregar términos de pago y condiciones</p>
                  </>
                ) : !flowStatus.hasAcceptedProposal ? (
                  <>
                    <p>• Sigue up con el cliente sobre la propuesta pendiente</p>
                    <p>• Puedes crear una propuesta alternativa si es necesario</p>
                    <p>• Considera ajustar términos si hay objeciones</p>
                  </>
                ) : flowStatus.hasRecurringFees ? (
                  <>
                    <p>• Las cuotas recurrentes están activas</p>
                    <p>• El tiempo se facturará automáticamente</p>
                    <p>• Revisa los límites de horas incluidas</p>
                  </>
                ) : (
                  <>
                    <p>• Ya puedes registrar tiempo y facturar al cliente</p>
                    <p>• Considera configurar cuotas recurrentes si aplica</p>
                    <p>• El tiempo no facturado aparecerá en próximas facturas</p>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}