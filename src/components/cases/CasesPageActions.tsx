
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu'
import { MatterTemplate } from '@/hooks/useMatterTemplates'
import { Case } from '@/hooks/useCases'

interface CasesPageActionsProps {
  templates: MatterTemplate[]
  filteredCases: Case[]
  onExportCases: (cases: Case[]) => void
  onUseTemplate: (templateId: string) => void
  onOpenCreateDialog: () => void
  onOpenAdvancedWizard: () => void
}

export function CasesPageActions({
  templates,
  filteredCases,
  onExportCases,
  onUseTemplate,
  onOpenCreateDialog,
  onOpenAdvancedWizard
}: CasesPageActionsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="default">
          Acciones
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem onClick={() => onExportCases(filteredCases)}>
          Exportar Expedientes
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem disabled>
          Plantillas ({templates.length})
        </DropdownMenuItem>
        {templates.map((template) => (
          <DropdownMenuItem 
            key={template.id} 
            className="pl-8"
            onClick={() => onUseTemplate(template.id)}
          >
            {template.name}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onOpenCreateDialog}>
          Nueva Plantilla Básica
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onOpenAdvancedWizard}>
          Nueva Plantilla Avanzada
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
