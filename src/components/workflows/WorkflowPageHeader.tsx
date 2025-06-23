
import React from 'react'
import { Button } from '@/components/ui/button'
import { Plus, Wand2 } from 'lucide-react'

interface WorkflowPageHeaderProps {
  onCreateWorkflow: () => void
  onShowWizard: () => void
}

const WorkflowPageHeader = React.memo<WorkflowPageHeaderProps>(({ 
  onCreateWorkflow, 
  onShowWizard 
}) => {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold">Automatizaciones Inteligentes</h1>
        <p className="text-muted-foreground">
          Automatiza procesos y libera tiempo para lo que realmente importa
        </p>
      </div>
      <div className="flex gap-2">
        <Button 
          variant="outline"
          onClick={onShowWizard}
        >
          <Wand2 className="w-4 h-4 mr-2" />
          Asistente
        </Button>
        <Button onClick={onCreateWorkflow}>
          <Plus className="w-4 h-4 mr-2" />
          Crear Workflow
        </Button>
      </div>
    </div>
  )
})

WorkflowPageHeader.displayName = 'WorkflowPageHeader'

export { WorkflowPageHeader }
