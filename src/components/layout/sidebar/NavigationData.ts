
import { Home, Users, FolderOpen, CheckSquare, FileText, Calendar, Clock, Zap, Brain, Settings } from 'lucide-react'

export const navigation = [
  { name: 'Dashboard', href: '/' },
  { name: 'Clientes', href: '/clients' },
  { name: 'Expedientes', href: '/cases' },
  { name: 'Tareas', href: '/tasks' },
  { name: 'Propuestas', href: '/proposals' },
  { name: 'Calendario', href: '/calendar' },
  { name: 'Tiempo', href: '/time-tracking' },
  { name: 'Workflows', href: '/workflows' },
  { name: 'IA Avanzada', href: '/advanced-ai' },
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
  icon: any
  path: string
  color: string
  requiredRoles: string[]
}

export const navigationItems: NavigationItem[] = [
  {
    title: 'Dashboard',
    icon: Home,
    path: '/',
    color: 'text-blue-600',
    requiredRoles: ['partner', 'area_manager', 'senior', 'junior']
  },
  {
    title: 'Clientes',
    icon: Users,
    path: '/clients',
    color: 'text-green-600',
    requiredRoles: ['partner', 'area_manager', 'senior', 'junior']
  },
  {
    title: 'Expedientes',
    icon: FolderOpen,
    path: '/cases',
    color: 'text-purple-600',
    requiredRoles: ['partner', 'area_manager', 'senior', 'junior']
  },
  {
    title: 'Tareas',
    icon: CheckSquare,
    path: '/tasks',
    color: 'text-orange-600',
    requiredRoles: ['partner', 'area_manager', 'senior', 'junior']
  },
  {
    title: 'Propuestas',
    icon: FileText,
    path: '/proposals',
    color: 'text-cyan-600',
    requiredRoles: ['partner', 'area_manager', 'senior']
  },
  {
    title: 'Calendario',
    icon: Calendar,
    path: '/calendar',
    color: 'text-red-600',
    requiredRoles: ['partner', 'area_manager', 'senior', 'junior']
  },
  {
    title: 'Control de Tiempo',
    icon: Clock,
    path: '/time-tracking',
    color: 'text-indigo-600',
    requiredRoles: ['partner', 'area_manager', 'senior', 'junior']
  },
  {
    title: 'Workflows',
    icon: Zap,
    path: '/workflows',
    color: 'text-yellow-600',
    requiredRoles: ['partner', 'area_manager']
  },
  {
    title: 'IA Avanzada',
    icon: Brain,
    path: '/advanced-ai',
    color: 'text-purple-600',
    requiredRoles: ['partner', 'area_manager', 'senior']
  },
  {
    title: 'Dashboard IA',
    icon: Brain,
    path: '/intelligent-dashboard',
    color: 'text-pink-600',
    requiredRoles: ['partner', 'area_manager', 'senior']
  },
  {
    title: 'Configuración',
    icon: Settings,
    path: '/integrations',
    color: 'text-gray-600',
    requiredRoles: ['partner', 'area_manager']
  }
]
