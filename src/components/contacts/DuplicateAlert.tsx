import { AlertTriangle, Eye, Trash2 } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useDuplicateDetection, DuplicateGroup } from '@/hooks/useDuplicateDetection'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { useState } from 'react'

export const DuplicateAlert = () => {
  const { data: duplicates = [], isLoading, refetch } = useDuplicateDetection()
  const [isOpen, setIsOpen] = useState(false)

  if (isLoading || duplicates.length === 0) {
    return null
  }

  const totalDuplicates = duplicates.reduce((sum, group) => sum + group.duplicate_count, 0)

  return (
    <Alert className="border-warning bg-warning/5">
      <AlertTriangle className="h-4 w-4 text-warning" />
      <AlertDescription className="flex items-center justify-between">
        <div>
          <span className="font-medium">
            Se detectaron {totalDuplicates} contactos duplicados en {duplicates.length} grupos
          </span>
          <p className="text-sm text-muted-foreground mt-1">
            Estos duplicados pueden afectar la integridad de los datos
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="text-warning border-warning hover:bg-warning/10"
          >
            <Eye className="h-4 w-4 mr-1" />
            Verificar
          </Button>
          
          <Collapsible open={isOpen} onOpenChange={setIsOpen}>
            <CollapsibleTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="text-warning border-warning hover:bg-warning/10"
              >
                {isOpen ? 'Ocultar' : 'Ver'} Detalles
              </Button>
            </CollapsibleTrigger>
            
            <CollapsibleContent className="mt-4">
              <div className="space-y-3">
                {duplicates.map((group: DuplicateGroup) => (
                  <div 
                    key={group.quantum_id} 
                    className="p-3 bg-background rounded-lg border border-warning/20"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="destructive" className="text-xs">
                          {group.duplicate_count} duplicados
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          Quantum ID: {group.quantum_id}
                        </span>
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Contactos duplicados:</p>
                      <ul className="text-sm text-muted-foreground">
                        {group.contact_names.map((name, index) => (
                          <li key={index} className="pl-2">• {name}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </AlertDescription>
    </Alert>
  )
}