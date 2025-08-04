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

// Stages
export { CaseStagesView } from './stages/CaseStagesView'

// Documents
export { CaseDocumentsPanel } from './documents/CaseDocumentsPanel'

// Time
export { CaseTimePanel } from './time/CaseTimePanel'

// Timeline
export { CaseTimeline } from './timeline/CaseTimeline'

// Tasks
export { CaseTasksPanel } from './tasks/CaseTasksPanel'

// Stats
export { CaseStatsPanel } from './stats/CaseStatsPanel'

// Forms
export { MatterFormDialog } from './forms/MatterFormDialog'