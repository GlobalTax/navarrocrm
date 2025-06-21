
import { Plus, Download, MoreVertical, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { MatterTemplate } from '@/hooks/useMatterTemplates'

interface CasesHeaderProps {
  templates: MatterTemplate[]
  onNewCase: () => void
}

export function CasesHeader({ templates, onNewCase }: CasesHeaderProps) {
  return (
    <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0 mb-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Expedientes</h1>
        <p className="text-gray-600">Gestiona todos los expedientes de la firma</p>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Exportar
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <FileText className="h-4 w-4 mr-2" />
              Plantillas
              <MoreVertical className="h-4 w-4 ml-2" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {templates.map((template) => (
              <DropdownMenuItem key={template.id}>
                {template.name}
              </DropdownMenuItem>
            ))}
            <DropdownMenuItem>
              <Plus className="h-4 w-4 mr-2" />
              Nueva Plantilla
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button onClick={onNewCase}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Expediente
        </Button>
      </div>
    </div>
  )
}
