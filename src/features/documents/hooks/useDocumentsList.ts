import { useDocumentsQueries } from './data/useDocumentsQueries'
import { useDocumentsActions } from './actions/useDocumentsActions'

export const useDocumentsList = () => {
  const queries = useDocumentsQueries()
  const actions = useDocumentsActions()
  
  return {
    ...queries,
    ...actions,
  }
}