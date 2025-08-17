import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Timer, 
  Play, 
  Pause, 
  Clock, 
  FileText, 
  Receipt, 
  AlertCircle, 
  CheckCircle,
  Zap
} from 'lucide-react'
import { Case } from '@/features/cases'
import { useCaseFlow } from '@/hooks/useCaseFlow'
import { useTimeEntries } from '@/hooks/useTimeEntries'
import { TimerModal } from './flow/TimerModal'
import { QuickTimeEntry } from './flow/QuickTimeEntry'
import { ProposalSuggestion } from './flow/ProposalSuggestion'
import { InvoiceDraftPreview } from './flow/InvoiceDraftPreview'
import { toast } from 'sonner'

interface CaseFlowActionsProps {
  case_: Case
}

export const CaseFlowActions = ({ case_ }: CaseFlowActionsProps) => {
  const [timerModalOpen, setTimerModalOpen] = useState(false)
  const [quickTimeOpen, setQuickTimeOpen] = useState(false)
  const [proposalModalOpen, setProposalModalOpen] = useState(false)
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false)

  const { flowStatus, caseProposals, unbilledEntries } = useCaseFlow(case_.id)
  const { createTimeEntry, isCreating } = useTimeEntries()

  const handleQuickTime = async (minutes: number, description: string) => {
    try {
      await createTimeEntry({
        case_id: case_.id,
        description,
        duration_minutes: minutes,
        is_billable: true,
        entry_type: 'billable'
      })
      setQuickTimeOpen(false)
      toast.success(`${minutes} minutos registrados`)
    } catch (error) {
      toast.error('Error al registrar tiempo')
    }
  }

  const getFlowStateInfo = () => {
    switch (flowStatus.flowState) {
      case 'no_proposal':
        return {
          icon: AlertCircle,
          color: 'bg-red-100 text-red-800 border-red-200',
          label: 'Sin propuesta',
          description: 'Crear propuesta para facturar'
        }
      case 'proposal_pending':
        return {
          icon: Clock,
          color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          label: 'Propuesta pendiente',
          description: 'Esperando aceptación del cliente'
        }
      case 'proposal_accepted':
        return {
          icon: CheckCircle,
          color: 'bg-green-100 text-green-800 border-green-200',
          label: 'Propuesta aceptada',
          description: 'Listo para facturar'
        }
      case 'has_recurring':
        return {
          icon: Receipt,
          color: 'bg-blue-100 text-blue-800 border-blue-200',
          label: 'Cuotas recurrentes',
          description: 'Facturación automática activa'
        }
      case 'ready_to_bill':
        return {
          icon: Zap,
          color: 'bg-purple-100 text-purple-800 border-purple-200',
          label: 'Listo para facturar',
          description: `${flowStatus.unbilledHours}h sin facturar`
        }
      default:
        return {
          icon: Timer,
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          label: 'Nuevo expediente',
          description: 'Comenzar registro de tiempo'
        }
    }
  }

  const stateInfo = getFlowStateInfo()
  const StateIcon = stateInfo.icon

  return (
    <>
      <Card className="border-[0.5px] border-black rounded-[10px]">
        <CardContent className="p-4">
          {/* Estado del flujo */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <StateIcon className="h-4 w-4" />
              <Badge 
                variant="outline" 
                className={`border-[0.5px] rounded-[10px] ${stateInfo.color}`}
              >
                {stateInfo.label}
              </Badge>
            </div>
            <div className="text-sm text-muted-foreground">
              {stateInfo.description}
            </div>
          </div>

          {/* Acciones principales */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Timer */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setTimerModalOpen(true)}
              className="flex items-center gap-2 border-[0.5px] border-black rounded-[10px]"
            >
              <Timer className="h-4 w-4" />
              Timer
            </Button>

            {/* Tiempo rápido */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setQuickTimeOpen(true)}
              className="flex items-center gap-2 border-[0.5px] border-black rounded-[10px]"
              disabled={isCreating}
            >
              <Clock className="h-4 w-4" />
              +Tiempo
            </Button>

            {/* Propuesta */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setProposalModalOpen(true)}
              className="flex items-center gap-2 border-[0.5px] border-black rounded-[10px]"
            >
              <FileText className="h-4 w-4" />
              {flowStatus.hasProposal ? 'Ver Propuesta' : 'Crear Propuesta'}
            </Button>

            {/* Factura */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setInvoiceModalOpen(true)}
              disabled={!flowStatus.hasAcceptedProposal && flowStatus.unbilledEntries === 0}
              className="flex items-center gap-2 border-[0.5px] border-black rounded-[10px]"
            >
              <Receipt className="h-4 w-4" />
              Facturar
            </Button>
          </div>

          {/* Información adicional */}
          {flowStatus.unbilledEntries > 0 && (
            <div className="mt-3 p-2 bg-orange-50 border border-orange-200 rounded-[10px]">
              <div className="flex items-center gap-2 text-sm text-orange-700">
                <AlertCircle className="h-4 w-4" />
                <span>
                  {flowStatus.unbilledEntries} entradas sin facturar 
                  ({flowStatus.unbilledHours}h)
                </span>
              </div>
            </div>
          )}

          {caseProposals.length > 0 && (
            <div className="mt-2 text-xs text-muted-foreground">
              Últimas propuestas: {caseProposals.slice(0, 2).map(p => p.proposal_number).join(', ')}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modales */}
      <TimerModal
        open={timerModalOpen}
        onOpenChange={setTimerModalOpen}
        caseId={case_.id}
        caseTitle={case_.title}
      />

      <QuickTimeEntry
        open={quickTimeOpen}
        onOpenChange={setQuickTimeOpen}
        onSubmit={handleQuickTime}
        caseTitle={case_.title}
      />

      <ProposalSuggestion
        open={proposalModalOpen}
        onOpenChange={setProposalModalOpen}
        case_={case_}
        existingProposals={caseProposals}
        flowStatus={flowStatus}
      />

      <InvoiceDraftPreview
        open={invoiceModalOpen}
        onOpenChange={setInvoiceModalOpen}
        case_={case_}
        unbilledEntries={unbilledEntries}
        flowStatus={flowStatus}
      />
    </>
  )
}