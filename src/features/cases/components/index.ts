/**
 * Componentes del módulo de casos
 */

// Layout y estructura principal
export { CasesStats } from '@/components/cases/CasesStats'
export { CasesBulkActions } from '@/components/cases/CasesBulkActions'
export { CasesTabsContent } from '@/components/cases/CasesTabsContent'
export { CasesLoadingState } from '@/components/cases/CasesLoadingState'

// Diálogos
export { CasesDialogManager } from './dialogs/CasesDialogManager'
export { CaseDetailDialog } from './dialogs/CaseDetailDialog'
export { CaseArchiveDialog } from './dialogs/CaseArchiveDialog'
export { CaseDeleteDialog } from './dialogs/CaseDeleteDialog'
export { NewTemplateDialog } from './dialogs/NewTemplateDialog'

// Wizard
export { MatterWizard } from './wizard/MatterWizard'

// Tabla y vistas
export { CaseViewSelector } from '@/components/cases/CaseViewSelector'
export { CasesTableView } from '@/components/cases/CasesTableView'
export { CasesCardView } from '@/components/cases/CasesCardView'

// Detalle de caso
export { CaseDetailTabs } from '@/components/cases/CaseDetailTabs'
export { CaseOverviewTab } from '@/components/cases/CaseOverviewTab'
export { CaseTasksTab } from '@/components/cases/CaseTasksTab'
export { CaseTimelineTab } from '@/components/cases/CaseTimelineTab'
export { CaseDocumentsTab } from '@/components/cases/CaseDocumentsTab'