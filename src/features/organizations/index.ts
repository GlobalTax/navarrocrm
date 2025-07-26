/**
 * Organizations Feature Module
 * 
 * Gestión de organizaciones y configuración
 */

// Components
export { OrganizationSettings } from './components/OrganizationSettings'
export { OrganizationForm } from './components/OrganizationForm'

// Hooks - Data Layer
export { useOrganizationQueries } from './hooks/data/useOrganizationQueries'

// Services & DAL
export { organizationsService } from './services/organizationsService'

// Types
export type {
  Organization,
  OrganizationSettings as OrgSettings
} from './types'
