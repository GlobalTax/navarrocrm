
import { Plus, Download, Settings, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu'
import { MatterTemplate } from '@/hooks/useMatterTemplates'

interface CasesHeaderProps {
  templates: MatterTemplate[]
  onNewCase: () => void
}

export function CasesHeader({ templates, onNewCase }: CasesHeaderProps) {
  return (
    <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0 mb-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Expedientes</h1>
      </div>
      <div className="flex items-center gap-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="default">
              <Settings className="h-4 w-4 mr-2" />
              Acciones
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem>
              <Download className="h-4 w-4 mr-2" />
              Exportar Expedientes
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem disabled>
              <FileText className="h-4 w-4 mr-2" />
              Plantillas ({templates.length})
            </DropdownMenuItem>
            {templates.map((template) => (
              <DropdownMenuItem key={template.id} className="pl-8">
                {template.name}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Plus className="h-4 w-4 mr-2" />
              Nueva Plantilla
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button onClick={onNewCase} size="default">
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Expediente
        </Button>
      </div>
    </div>
  )
}
