
import { StandardPageHeader } from '@/components/layout/StandardPageHeader'
import { Button } from '@/components/ui/button'
import { Repeat, FileText } from 'lucide-react'

interface ProposalsPageHeaderProps {
  onOpenRecurrentBuilder: () => void
  onOpenSpecificBuilder: () => void
}

export const ProposalsPageHeader = ({
  onOpenRecurrentBuilder,
  onOpenSpecificBuilder
}: ProposalsPageHeaderProps) => {
  const badges = [
    {
      label: "Recurrentes: Fiscal, Contabilidad, Laboral",
      variant: "outline" as const,
      color: "text-blue-600 border-blue-200 bg-blue-50"
    },
    {
      label: "Puntuales: Proyectos específicos",
      variant: "outline" as const,
      color: "text-green-600 border-green-200 bg-green-50"
    }
  ]

  const actions = (
    <div className="flex flex-col gap-3">
      <Button onClick={onOpenRecurrentBuilder} variant="outline" size="lg" className="justify-start crm-button-text">
        <Repeat className="h-4 w-4 mr-2 text-blue-600" />
        <div className="text-left">
          <div className="font-semibold">Propuesta Recurrente</div>
          <div className="text-xs text-gray-500">Servicios continuos → Cuotas</div>
        </div>
      </Button>
      <Button onClick={onOpenSpecificBuilder} variant="default" size="lg" className="justify-start crm-button-text">
        <FileText className="h-4 w-4 mr-2" />
        <div className="text-left">
          <div className="font-semibold">Propuesta Puntual</div>
          <div className="text-xs text-white/80">Servicios específicos → Expedientes</div>
        </div>
      </Button>
    </div>
  )

  return (
    <StandardPageHeader
      title="Propuestas Comerciales"
      description="Gestiona propuestas recurrentes y servicios puntuales"
      badges={badges}
      actions={actions}
    />
  )
}
