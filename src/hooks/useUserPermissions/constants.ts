
import type { PermissionModule, PermissionLevel } from './types'

export const AVAILABLE_MODULES: PermissionModule[] = [
  { key: 'cases', label: 'Expedientes', description: 'Gestión de casos y expedientes legales' },
  { key: 'contacts', label: 'Contactos', description: 'Gestión de clientes y contactos' },
  { key: 'proposals', label: 'Propuestas', description: 'Creación y gestión de propuestas' },
  { key: 'time_tracking', label: 'Control de Tiempo', description: 'Registro y seguimiento de horas' },
  { key: 'reports', label: 'Informes', description: 'Visualización y generación de informes' },
  { key: 'billing', label: 'Facturación', description: 'Gestión de facturación y pagos' },
  { key: 'users', label: 'Usuarios', description: 'Administración de usuarios del sistema' },
  { key: 'settings', label: 'Configuración', description: 'Configuración del sistema y organización' }
]

export const PERMISSION_LEVELS: PermissionLevel[] = [
  { key: 'read', label: 'Lectura', description: 'Puede ver y consultar información' },
  { key: 'write', label: 'Escritura', description: 'Puede crear y editar información' },
  { key: 'delete', label: 'Eliminación', description: 'Puede eliminar información' },
  { key: 'admin', label: 'Administrador', description: 'Control total sobre el módulo' }
]
