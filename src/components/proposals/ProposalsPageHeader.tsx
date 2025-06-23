
import { Button } from '@/components/ui/button'
import { Plus, FileText, Calculator } from 'lucide-react'

interface ProposalsPageHeaderProps {
  onOpenNewProposal: () => void
  onOpenEnhancedBuilder: () => void
  onOpenProfessionalBuilder: () => void
  onOpenAdvancedProfessionalBuilder: () => void
}

export const ProposalsPageHeader = ({
  onOpenNewProposal,
  onOpenEnhancedBuilder,
  onOpenProfessionalBuilder,
  onOpenAdvancedProfessionalBuilder
}: ProposalsPageHeaderProps) => {
  return (
    <div className="flex justify-between items-center">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Propuestas</h1>
        <p className="text-gray-600 mt-1">Gestiona tus propuestas comerciales y contratos recurrentes</p>
      </div>
      <div className="flex gap-2">
        <Button onClick={onOpenNewProposal} variant="outline">
          <Plus className="h-4 w-4 mr-2" />
          Propuesta Rápida
        </Button>
        <Button onClick={onOpenEnhancedBuilder} variant="outline">
          <FileText className="h-4 w-4 mr-2" />
          Propuesta Avanzada
        </Button>
        <Button onClick={onOpenProfessionalBuilder} variant="outline">
          <Calculator className="h-4 w-4 mr-2" />
          Propuesta Profesional
        </Button>
        <Button onClick={onOpenAdvancedProfessionalBuilder} variant="default">
          <FileText className="h-4 w-4 mr-2" />
          Propuesta Ejecutiva
        </Button>
      </div>
    </div>
  )
}
