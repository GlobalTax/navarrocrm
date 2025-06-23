
import { ProposalBuilder } from '@/modules/proposals/components/ProposalBuilder'
import { ProfessionalProposalBuilder } from '@/components/proposals/ProfessionalProposalBuilder'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Repeat, FileText } from 'lucide-react'
import { ProposalFormData } from '@/modules/proposals/types/proposal.schema'

interface ProposalsBuilderManagerProps {
  isRecurrentBuilderOpen: boolean
  isSpecificBuilderOpen: boolean
  onCloseRecurrentBuilder: () => void
  onCloseSpecificBuilder: () => void
  onSaveRecurrentProposal: (data: ProposalFormData) => void
  isSavingRecurrent: boolean
}

export const ProposalsBuilderManager = ({
  isRecurrentBuilderOpen,
  isSpecificBuilderOpen,
  onCloseRecurrentBuilder,
  onCloseSpecificBuilder,
  onSaveRecurrentProposal,
  isSavingRecurrent
}: ProposalsBuilderManagerProps) => {
  // Mostrar el constructor de propuestas recurrentes
  if (isRecurrentBuilderOpen) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Repeat className="h-8 w-8 text-blue-600" />
              <h1 className="text-3xl font-bold text-gray-900">Nueva Propuesta Recurrente</h1>
            </div>
            <p className="text-gray-600">Servicios continuos como fiscal, contabilidad y laboral → Genera Cuotas Recurrentes</p>
          </div>
          <Button variant="outline" onClick={onCloseRecurrentBuilder}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
        </div>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Repeat className="h-4 w-4 text-blue-600" />
            <span className="font-semibold text-blue-900">Propuesta Recurrente</span>
          </div>
          <p className="text-sm text-blue-700">
            Al ser aceptada, esta propuesta generará automáticamente una <strong>Cuota Recurrente</strong> 
            que permitirá facturación periódica y control de horas incluidas.
          </p>
        </div>
        
        <ProposalBuilder
          onSave={onSaveRecurrentProposal}
          isSaving={isSavingRecurrent}
        />
      </div>
    )
  }

  // Mostrar el constructor de propuestas puntuales
  if (isSpecificBuilderOpen) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <FileText className="h-8 w-8 text-green-600" />
              <h1 className="text-3xl font-bold text-gray-900">Nueva Propuesta Puntual</h1>
            </div>
            <p className="text-gray-600">Servicios específicos y proyectos únicos → Genera Expedientes</p>
          </div>
          <Button variant="outline" onClick={onCloseSpecificBuilder}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
        </div>
        
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="h-4 w-4 text-green-600" />
            <span className="font-semibold text-green-900">Propuesta Puntual</span>
          </div>
          <p className="text-sm text-green-700">
            Al ser aceptada, esta propuesta generará automáticamente un <strong>Expediente</strong> 
            para gestionar las tareas, documentos y seguimiento del proyecto.
          </p>
        </div>
        
        <ProfessionalProposalBuilder onBack={onCloseSpecificBuilder} />
      </div>
    )
  }

  return null
}
