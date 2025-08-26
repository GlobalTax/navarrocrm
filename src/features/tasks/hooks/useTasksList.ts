import { useTasksQueries } from './data/useTasksQueries'
import { useTasksActions } from './actions/useTasksActions'

export const useTasksList = () => {
  const queries = useTasksQueries()
  const actions = useTasksActions()
  
  return {
    ...queries,
    ...actions,
  }
}