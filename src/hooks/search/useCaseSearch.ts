
import { useIntelligentSearch } from './useIntelligentSearch'

export const useCaseSearch = (cases: any[]) => {
  return useIntelligentSearch(cases, {
    searchFields: ['title', 'description', 'practice_area', 'matter_number'],
    filters: {
      status: { 
        type: 'select',
        options: ['open', 'closed', 'on_hold', 'archived']
      },
      practice_area: { 
        type: 'contains'
      },
      billing_method: { 
        type: 'select',
        options: ['hourly', 'fixed', 'retainer']
      }
    },
    fuzzySearch: true,
    debounceMs: 300,
    maxResults: 50
  })
}
