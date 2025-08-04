/**
 * Cases Components - Barrel Export
 */

// Main components
export { CaseTable } from './CaseTable'
export { VirtualizedCaseTable } from './VirtualizedCaseTable'
export { CasesStats } from './CasesStats'
export { CasesFilters } from './CasesFilters'
export { CasesHeader } from './CasesHeader'
export { CasesTabsContent } from './CasesTabsContent'
export { CasesBulkActions } from './CasesBulkActions'
export { CasesLoadingState } from './CasesLoadingState'

// Dialog components
export { CaseDetailDialog } from './dialogs/CaseDetailDialog'
export { CaseArchiveDialog } from './dialogs/CaseArchiveDialog'
export { CaseDeleteDialog } from './dialogs/CaseDeleteDialog'
export { CasesDialogManager } from './dialogs/CasesDialogManager'
export { NewTemplateDialog } from './dialogs/NewTemplateDialog'

// Form components
export { MatterDetailsForm } from './forms/MatterDetailsForm'
export { MatterBillingForm } from './forms/MatterBillingForm'
export { MatterTemplateSelector } from './forms/MatterTemplateSelector'
export { MatterPlaceholderCard } from './forms/MatterPlaceholderCard'

// Wizard components
export { MatterWizard } from './wizard/MatterWizard'
export { WizardStep1 } from './wizard/WizardStep1'
export { WizardStep2 } from './wizard/WizardStep2'
export { WizardStep3 } from './wizard/WizardStep3'
export { WizardNavigation } from './wizard/WizardNavigation'
export { useWizardState } from './wizard/useWizardState'
export type { WizardFormData, WizardStep, MatterWizardProps } from './wizard/types'

// Timeline components
export { CaseTimeline } from '@/components/cases/timeline/CaseTimeline'
export { CaseTimelineEvent } from '@/components/cases/timeline/CaseTimelineEvent'

// Stages components  
export { StageCard } from '@/components/cases/stages/StageCard'
export { StageFormDialog } from '@/components/cases/stages/StageFormDialog'

// Tasks components
export { CaseTasksPanel } from '@/components/cases/tasks/CaseTasksPanel'

// Stats components
export { CaseStatsPanel } from '@/components/cases/stats/CaseStatsPanel'