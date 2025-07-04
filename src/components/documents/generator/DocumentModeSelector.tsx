import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Zap, FileText } from 'lucide-react'

interface DocumentModeSelectorProps {
  useAdvancedMode: boolean
  onModeChange: (advanced: boolean) => void
}

export const DocumentModeSelector = ({
  useAdvancedMode,
  onModeChange
}: DocumentModeSelectorProps) => {
  return (
    <div className="flex items-center gap-4 mb-4">
      <div className="flex items-center space-x-2">
        <Switch
          id="advanced_mode"
          checked={useAdvancedMode}
          onCheckedChange={onModeChange}
        />
        <Label htmlFor="advanced_mode" className="flex items-center gap-2">
          {useAdvancedMode ? (
            <>
              <Zap className="h-4 w-4" />
              Modo Avanzado
            </>
          ) : (
            <>
              <FileText className="h-4 w-4" />
              Modo Tradicional
            </>
          )}
        </Label>
      </div>
      <span className="text-sm text-muted-foreground">
        {useAdvancedMode 
          ? 'Asistente paso a paso con validación y IA' 
          : 'Formulario tradicional simple'
        }
      </span>
    </div>
  )
}