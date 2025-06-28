
import { useTaskQueries } from './tasks/useTaskQueries'
import { useTaskMutations } from './tasks/useTaskMutations'

export const useTasks = () => {
  const queryResults = useTaskQueries()
  const mutations = useTaskMutations()

  return {
    ...queryResults,
    ...mutations,
  }
}
