
import { Button } from '@/components/ui/button'
import { Plus, FileText } from 'lucide-react'

interface ProposalsPageHeaderProps {
  onOpenBasicBuilder: () => void
  onOpenProfessionalBuilder: () => void
}

export const ProposalsPageHeader = ({
  onOpenBasicBuilder,
  onOpenProfessionalBuilder
}: ProposalsPageHeaderProps) => {
  return (
    <div className="flex justify-between items-center">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Propuestas Comerciales</h1>
        <p className="text-gray-600 mt-1">Crea y gestiona propuestas para tus clientes</p>
      </div>
      <div className="flex gap-3">
        <Button onClick={onOpenBasicBuilder} variant="outline" size="lg">
          <Plus className="h-4 w-4 mr-2" />
          Propuesta Básica
        </Button>
        <Button onClick={onOpenProfessionalBuilder} variant="default" size="lg">
          <FileText className="h-4 w-4 mr-2" />
          Propuesta Profesional
        </Button>
      </div>
    </div>
  )
}
