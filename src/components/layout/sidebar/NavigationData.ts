
import { 
  Home, 
  Users, 
  FolderOpen, 
  CheckSquare, 
  FileText, 
  Clock, 
  BarChart3, 
  Settings,
  UserCircle,
  Building2,
  Handshake
} from 'lucide-react'

export interface NavigationItem {
  name: string
  href: string
  icon: any
  current?: boolean
  badge?: string | number
}

export interface NavigationSection {
  title?: string
  items: NavigationItem[]
}

export const getNavigationSections = (): NavigationSection[] => [
  {
    items: [
      { name: 'Dashboard', href: '/dashboard', icon: Home },
    ]
  },
  {
    title: 'Gestión',
    items: [
      { name: 'Clientes', href: '/clients', icon: Building2 },
      { name: 'Contactos', href: '/contacts', icon: UserCircle },
      { name: 'Casos', href: '/cases', icon: FolderOpen },
      { name: 'M&A Deals', href: '/deals', icon: Handshake },
      { name: 'Tareas', href: '/tasks', icon: CheckSquare },
      { name: 'Propuestas', href: '/proposals', icon: FileText },
    ]
  },
  {
    title: 'Herramientas',
    items: [
      { name: 'Time Tracking', href: '/time-tracking', icon: Clock },
      { name: 'Workflows', href: '/workflows', icon: Settings },
      { name: 'Analytics', href: '/predictive-analytics', icon: BarChart3 },
    ]
  }
]
