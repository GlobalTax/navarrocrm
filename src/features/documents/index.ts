/**
 * Documents Feature Module
 * Punto de entrada centralizado para toda la funcionalidad de documentos
 */

// Re-exports de componentes principales
export { DocumentsLibrary } from './components'
export { DocumentEditor } from './components'
export { DocumentVersions } from './components'
export { TemplateManager } from './components'
export { DocumentAnalysis } from './components'
export { DocumentUpload } from './components'
export { DocumentSharing } from './components'

// Re-exports de hooks
export { useDocuments } from './hooks'
export { useDocumentEditor } from './hooks'
export { useDocumentVersions } from './hooks'

// Re-exports de tipos
export type {
  Document,
  DocumentTemplate,
  DocumentVersion,
  DocumentActivity,
  DocumentAnalysisResult
} from './types'