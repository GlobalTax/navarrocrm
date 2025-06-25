
import { useIntelligentSearch } from './useIntelligentSearch'

export const useTaskSearch = (tasks: any[]) => {
  return useIntelligentSearch(tasks, {
    searchFields: ['title', 'description', 'tags'],
    filters: {
      status: { 
        type: 'select',
        options: ['pending', 'in_progress', 'completed', 'cancelled']
      },
      priority: { 
        type: 'select',
        options: ['low', 'medium', 'high', 'urgent']
      }
    },
    fuzzySearch: true,
    debounceMs: 300,
    maxResults: 50
  })
}
