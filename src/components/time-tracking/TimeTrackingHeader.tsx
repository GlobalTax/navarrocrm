
import { StandardPageHeader } from '@/components/layout/StandardPageHeader'
import { Plus, Download, Target, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function TimeTrackingHeader() {
  const badges = [
    {
      label: "Objetivo: 8h diarias",
      variant: "outline" as const,
      color: "text-green-600 border-green-200"
    },
    {
      label: "+15% vs semana pasada", 
      variant: "outline" as const,
      color: "text-blue-600 border-blue-200"
    }
  ]

  const actions = (
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
  )

  return (
    <StandardPageHeader
      title="Control de Tiempo"
      badges={badges}
      actions={actions}
    />
  )
}
