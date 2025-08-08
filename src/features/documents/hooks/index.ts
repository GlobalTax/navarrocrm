// Data layer hooks
export { useDocumentsQueries } from './data/useDocumentsQueries'

// Main composite hook
export { useDocumentsList } from './useDocumentsList'

// Actions
export const useDocumentsActions = () => ({
  createDocument: () => {},
  updateDocument: () => {},
  deleteDocument: () => {}
})