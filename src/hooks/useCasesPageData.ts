
import { useCases } from '@/features/cases'

export const useCasesPageData = () => {
  const casesHook = useCases()
  
  return {
    ...casesHook,
    // Añadir propiedades que faltan para bulk selection
    selectedCases: [],
    handleSelectCase: (caseId: string, selected: boolean) => {
      // Esta funcionalidad se implementará en el componente padre
      console.log('Select case:', caseId, selected)
    },
    handleSelectAll: (selected: boolean) => {
      // Esta funcionalidad se implementará en el componente padre
      console.log('Select all:', selected)
    }
  }
}
