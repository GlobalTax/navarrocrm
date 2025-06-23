
export const navigation = [
  { name: 'Dashboard', href: '/' },
  { name: 'Clientes', href: '/clients' },
  { name: 'Expedientes', href: '/cases' },
  { name: 'Tareas', href: '/tasks' },
  { name: 'Propuestas', href: '/proposals' },
  { name: 'Cuotas Recurrentes', href: '/recurrent-fees' },
  { name: 'Calendario', href: '/calendar' },
  { name: 'Tiempo', href: '/time-tracking' },
  { name: 'Workflows', href: '/workflows' },
  { name: 'IA Avanzada', href: '/advanced-ai' },
  { name: 'Academia', href: '/academia' },
  { name: 'Integraciones', href: '/integrations' },
  { name: 'IA Admin', href: '/ai-admin' },
]

export const quickActions = [
  { name: 'Crear cliente', href: '/clients' },
  { name: 'Crear expediente', href: '/cases' },
  { name: 'Nueva tarea', href: '/tasks' },
  { name: 'Programar cita', href: '/calendar' },
  { name: 'Iniciar timer', href: '/time-tracking' },
  { name: 'Generar factura', href: '#' }
]

interface NavigationItem {
  title: string
  path: string
  requiredRoles: string[]
}

export const navigationItems: NavigationItem[] = [
  {
    title: 'Dashboard',
    path: '/',
    requiredRoles: ['partner', 'area_manager', 'senior', 'junior']
  },
  {
    title: 'Clientes',
    path: '/clients',
    requiredRoles: ['partner', 'area_manager', 'senior', 'junior']
  },
  {
    title: 'Expedientes',
    path: '/cases',
    requiredRoles: ['partner', 'area_manager', 'senior', 'junior']
  },
  {
    title: 'Tareas',
    path: '/tasks',
    requiredRoles: ['partner', 'area_manager', 'senior', 'junior']
  },
  {
    title: 'Propuestas',
    path: '/proposals',
    requiredRoles: ['partner', 'area_manager', 'senior']
  },
  {
    title: 'Cuotas Recurrentes',
    path: '/recurrent-fees',
    requiredRoles: ['partner', 'area_manager', 'senior']
  },
  {
    title: 'Calendario',
    path: '/calendar',
    requiredRoles: ['partner', 'area_manager', 'senior', 'junior']
  },
  {
    title: 'Control de Tiempo',
    path: '/time-tracking',
    requiredRoles: ['partner', 'area_manager', 'senior', 'junior']
  },
  {
    title: 'Workflows',
    path: '/workflows',
    requiredRoles: ['partner', 'area_manager']
  },
  {
    title: 'IA Avanzada',
    path: '/advanced-ai',
    requiredRoles: ['partner', 'area_manager', 'senior']
  },
  {
    title: 'Academia',
    path: '/academia',
    requiredRoles: ['partner', 'area_manager', 'senior', 'junior']
  },
  {
    title: 'Dashboard IA',
    path: '/intelligent-dashboard',
    requiredRoles: ['partner', 'area_manager', 'senior']
  },
  {
    title: 'Configuración',
    path: '/integrations',
    requiredRoles: ['partner', 'area_manager']
  }
]
