
import { Button } from '@/components/ui/button'
import { Plus, Download, Target, TrendingUp } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export function TimeTrackingHeader() {
  return (
    <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
      <div>
        <h1 className="crm-page-title">Control de Tiempo</h1>
        <div className="flex items-center gap-2 mt-2">
          <Badge variant="outline" className="text-green-600 border-green-200 crm-badge-text">
            <Target className="h-3 w-3 mr-1" />
            Objetivo: 8h diarias
          </Badge>
          <Badge variant="outline" className="text-blue-600 border-blue-200 crm-badge-text">
            <TrendingUp className="h-3 w-3 mr-1" />
            +15% vs semana pasada
          </Badge>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <Button variant="outline" className="flex items-center gap-2 crm-button-text">
          <Download className="h-4 w-4" />
          Exportar
        </Button>
        <Button className="flex items-center gap-2 crm-button-text">
          <Plus className="h-4 w-4" />
          Nuevo Registro
        </Button>
      </div>
    </div>
  )
}
