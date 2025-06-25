
import { useIntelligentSearch } from './useIntelligentSearch'

export const useContactSearch = (contacts: any[]) => {
  return useIntelligentSearch(contacts, {
    searchFields: ['name', 'email', 'phone', 'dni_nif'],
    filters: {
      status: { 
        type: 'select',
        options: ['activo', 'inactivo', 'prospecto', 'bloqueado']
      },
      relationship_type: { 
        type: 'select',
        options: ['prospecto', 'cliente', 'ex_cliente']
      },
      client_type: { 
        type: 'select',
        options: ['particular', 'empresa', 'autonomo']
      }
    },
    fuzzySearch: true,
    debounceMs: 300,
    maxResults: 50
  })
}
