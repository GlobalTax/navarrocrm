
import { 
  Home, 
  Users, 
  FileText, 
  Clock, 
  Briefcase, 
  Settings, 
  Calculator,
  Calendar,
  MessageSquare,
  Target,
  GraduationCap,
  BarChart3,
  Brain,
  Plus,
  FileCheck,
  UserPlus
} from 'lucide-react'

export const navigationData = {
  main: [
    {
      title: 'Inicio',
      href: '/dashboard',
      icon: Home
    },
    {
      title: 'Contactos',
      href: '/contacts',
      icon: Users
    },
    {
      title: 'Expedientes',
      href: '/cases',
      icon: FileText
    },
    {
      title: 'Deals',
      href: '/deals',
      icon: Target
    },
    {
      title: 'Tiempo',
      href: '/time',
      icon: Clock
    },
    {
      title: 'Propuestas',
      href: '/proposals',
      icon: Briefcase
    },
    {
      title: 'Calendario',
      href: '/calendar',
      icon: Calendar
    }
  ],
  
  tools: [
    {
      title: 'Tareas',
      href: '/tasks',
      icon: MessageSquare
    },
    {
      title: 'Academia',
      href: '/academia',
      icon: GraduationCap
    },
    {
      title: 'Calculadora',
      href: '/calculator',
      icon: Calculator
    }
  ],
  
  analytics: [
    {
      title: 'Analítica',
      href: '/analytics',
      icon: BarChart3
    },
    {
      title: 'IA Avanzada',
      href: '/ai-tools',
      icon: Brain
    }
  ],
  
  admin: [
    {
      title: 'Configuración',
      href: '/settings',
      icon: Settings
    }
  ]
}

// Agregar quickActions que estaba faltando
export const quickActions = [
  {
    name: 'Nueva Propuesta',
    href: '/proposals'
  },
  {
    name: 'Nuevo Contacto',
    href: '/contacts'
  },
  {
    name: 'Nuevo Expediente',
    href: '/cases'
  }
]
