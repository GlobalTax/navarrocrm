
import {
  LayoutDashboard,
  Users,
  FolderOpen,
  Clock,
  FileText,
  Calendar,
  Building2,  // Añado este icono para la gestión de oficina
  BarChart3,
  Settings,
  Zap,
  Briefcase,
  Euro,
  UserPlus,
  Bot,
  GraduationCap,
  Workflow
} from 'lucide-react'

// Navigation items for different user roles
export const getNavigationItems = (userRole?: string) => {
  const baseItems = [
    {
      title: 'Dashboard',
      url: '/dashboard',
      icon: LayoutDashboard,
      category: 'main'
    },
    {
      title: 'Expedientes',
      url: '/cases',
      icon: FolderOpen,
      category: 'main'
    },
    {
      title: 'Clientes',
      url: '/clients',
      icon: Users,
      category: 'main'
    },
    {
      title: 'Contactos',
      url: '/contacts',
      icon: UserPlus,
      category: 'main'
    },
    {
      title: 'Tiempo',
      url: '/time-tracking',
      icon: Clock,
      category: 'main'
    },
    {
      title: 'Propuestas',
      url: '/proposals',
      icon: FileText,
      category: 'business'
    },
    {
      title: 'Cuotas Recurrentes',
      url: '/recurrent-fees',
      icon: Euro,
      category: 'business'
    },
    {
      title: 'Tareas',
      url: '/tasks',
      icon: Briefcase,
      category: 'productivity'
    },
    {
      title: 'Calendario',
      url: '/calendar',
      icon: Calendar,
      category: 'productivity'
    },
    {
      title: 'Gestión de Oficina',  // Nuevo elemento de navegación
      url: '/office-management',
      icon: Building2,
      category: 'productivity'
    },
    {
      title: 'Documentos',
      url: '/documents',
      icon: FileText,
      category: 'productivity'
    }
  ]

  const adminItems = [
    {
      title: 'Usuarios',
      url: '/users',
      icon: Users,
      category: 'admin'
    },
    {
      title: 'Configuración',
      url: '/integration-settings',
      icon: Settings,
      category: 'admin'
    }
  ]

  const analyticsItems = [
    {
      title: 'Analíticas',
      url: '/analytics',
      icon: BarChart3,
      category: 'analytics'
    },
    {
      title: 'Reportes',
      url: '/reports',
      icon: FileText,
      category: 'analytics'
    },
    {
      title: 'Flujos de Trabajo',
      url: '/workflows',
      icon: Workflow,
      category: 'analytics'
    }
  ]

  const aiItems = [
    {
      title: 'IA Avanzada',
      url: '/enhanced-advanced-ai',
      icon: Bot,
      category: 'ai'
    },
    {
      title: 'Academia',
      url: '/academia',
      icon: GraduationCap,
      category: 'ai'
    }
  ]

  let allItems = [...baseItems]

  // Add items based on user role
  if (userRole === 'admin' || userRole === 'partner') {
    allItems = [...allItems, ...adminItems, ...analyticsItems, ...aiItems]
  } else if (userRole === 'manager') {
    allItems = [...allItems, ...analyticsItems.slice(0, 2), ...aiItems] // Exclude workflows for managers
  } else {
    allItems = [...allItems, ...aiItems]
  }

  return allItems
}

export const navigationCategories = {
  main: 'Principal',
  business: 'Negocio',
  productivity: 'Productividad',
  analytics: 'Analíticas',
  admin: 'Administración',
  ai: 'Inteligencia Artificial'
}

// Export quickActions for QuickActionsSection
export const quickActions = [
  {
    name: 'Nuevo Cliente',
    href: '/clients'
  },
  {
    name: 'Nuevo Caso',
    href: '/cases'
  },
  {
    name: 'Nueva Tarea',
    href: '/tasks'
  }
]
