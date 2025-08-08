
import React from 'react'
import { StandardPageHeader } from '@/components/layout/StandardPageHeader'
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
    <StandardPageHeader
      title="Automatizaciones Inteligentes"
      description="Automatiza procesos y libera tiempo para lo que realmente importa"
      secondaryAction={{
        label: "Asistente",
        onClick: onShowWizard,
        variant: "outline"
      }}
      primaryAction={{
        label: "Crear Workflow",
        onClick: onCreateWorkflow
      }}
    />
  )
})

WorkflowPageHeader.displayName = 'WorkflowPageHeader'

export { WorkflowPageHeader }
