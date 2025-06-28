
import type { PermissionModule, PermissionLevel } from './types'

export const AVAILABLE_MODULES: readonly PermissionModule[] = [
  { key: 'cases', label: 'Casos' },
  { key: 'contacts', label: 'Contactos' },
  { key: 'proposals', label: 'Propuestas' },
  { key: 'time_tracking', label: 'Control de Tiempo' },
  { key: 'reports', label: 'Reportes' },
  { key: 'users', label: 'Gestión de Usuarios' },
  { key: 'integrations', label: 'Integraciones' },
  { key: 'billing', label: 'Facturación' }
] as const

export const PERMISSION_LEVELS: readonly PermissionLevel[] = [
  { key: 'read', label: 'Lectura' },
  { key: 'write', label: 'Escritura' },
  { key: 'delete', label: 'Eliminación' },
  { key: 'admin', label: 'Administración' }
] as const
