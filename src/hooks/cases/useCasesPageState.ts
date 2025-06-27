
import { useCases } from '@/hooks/useCases'
import { usePracticeAreas } from '@/hooks/usePracticeAreas'
import { useUsers } from '@/hooks/useUsers'
import { useMatterTemplates } from '@/hooks/useMatterTemplates'
import { useMatterTemplateActions } from '@/hooks/useMatterTemplateActions'
import { useCasesHandlers } from '@/hooks/cases/useCasesHandlers'

export const useCasesPageState = () => {
  const casesData = useCases()
  const { practiceAreas = [] } = usePracticeAreas()
  const { users = [] } = useUsers()
  const { templates = [] } = useMatterTemplates()
  
  const templateActions = useMatterTemplateActions()
  
  const handlers = useCasesHandlers(
    casesData.createCase, 
    casesData.deleteCase, 
    casesData.archiveCase
  )

  const statusOptions = [
    { label: 'Todos los estados', value: 'all' },
    { label: 'Activos', value: 'active' },
    { label: 'Abierto', value: 'open' },
    { label: 'En espera', value: 'on_hold' },
    { label: 'Cerrado', value: 'closed' },
    { label: 'Archivados', value: 'archived' }
  ]

  const practiceAreaOptions = [
    { label: 'Todas las áreas', value: 'all' },
    ...practiceAreas.map(area => ({ label: area.name, value: area.name }))
  ]

  const solicitorOptions = [
    { label: 'Todos los abogados', value: 'all' },
    ...users.map(user => ({ label: user.email, value: user.id }))
  ]

  return {
    ...casesData,
    practiceAreas,
    users,
    templates,
    ...templateActions,
    handlers,
    statusOptions,
    practiceAreaOptions,
    solicitorOptions
  }
}
