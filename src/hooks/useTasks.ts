
import { useTaskQueriesWithCache } from './tasks/useTaskQueriesWithCache'
import { useTaskMutations } from './tasks/useTaskMutations'

export const useTasks = () => {
  const queryResults = useTaskQueriesWithCache()
  const mutations = useTaskMutations()

  return {
    ...queryResults,
    ...mutations,
  }
}
