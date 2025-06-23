
import { Button } from '@/components/ui/button'
import { Plus, Repeat, FileText, TrendingUp } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface ProposalsPageHeaderProps {
  onOpenRecurrentBuilder: () => void
  onOpenSpecificBuilder: () => void
}

export const ProposalsPageHeader = ({
  onOpenRecurrentBuilder,
  onOpenSpecificBuilder
}: ProposalsPageHeaderProps) => {
  return (
    <div className="flex justify-between items-start">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">Propuestas Comerciales</h1>
        <p className="text-gray-600">Gestiona propuestas recurrentes y servicios puntuales</p>
        <div className="flex items-center gap-3 mt-3">
          <Badge variant="outline" className="text-blue-600 border-blue-200 bg-blue-50">
            <Repeat className="h-3 w-3 mr-1" />
            Recurrentes: Fiscal, Contabilidad, Laboral
          </Badge>
          <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
            <FileText className="h-3 w-3 mr-1" />
            Puntuales: Proyectos específicos
          </Badge>
        </div>
      </div>
      <div className="flex flex-col gap-3">
        <Button onClick={onOpenRecurrentBuilder} variant="outline" size="lg" className="justify-start">
          <Repeat className="h-4 w-4 mr-2 text-blue-600" />
          <div className="text-left">
            <div className="font-semibold">Propuesta Recurrente</div>
            <div className="text-xs text-gray-500">Servicios continuos → Cuotas</div>
          </div>
        </Button>
        <Button onClick={onOpenSpecificBuilder} variant="default" size="lg" className="justify-start">
          <FileText className="h-4 w-4 mr-2" />
          <div className="text-left">
            <div className="font-semibold">Propuesta Puntual</div>
            <div className="text-xs text-white/80">Servicios específicos → Expedientes</div>
          </div>
        </Button>
      </div>
    </div>
  )
}
