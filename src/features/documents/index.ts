/**
 * Documents Feature Module
 * 
 * Gestión de documentos y plantillas
 */

// Components (pages)
export { default as DocumentsPage } from './pages/DocumentsPage'

// Components
export { DocumentsList } from './components/DocumentsList'
export { DocumentFilters } from './components/DocumentFilters'
export { DocumentGeneratorDialog } from './components/DocumentGeneratorDialog'

// Hooks
export { useDocumentsList, useDocumentsQueries, useDocumentsActions } from './hooks'

// Legacy exports
export { documentsDAL } from '@/lib/dal'
export type { Document } from '@/lib/dal'