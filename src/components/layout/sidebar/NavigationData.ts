import { Users, FileText, Clock, Calendar, FolderOpen, Settings, BarChart3, BookOpen, Bot, Shield, Briefcase, UserCog, Wrench, Monitor, Grid3X3, Mail, Euro, Package, CreditCard, FileSignature } from 'lucide-react'

export interface NavigationItem {
  title: string
  url: string
  icon: any
  badge?: string
  isActive?: boolean
}

export interface NavigationSection {
  title: string
  items: NavigationItem[]
}

export interface QuickAction {
  name: string
  href: string
}

export const navigationData: NavigationSection[] = [
  {
    title: "Principal",
    items: [
      {
        title: "Dashboard",
        url: "/",
        icon: BarChart3,
      },
    {
      title: "Email",
      url: "/emails",
      icon: Mail,
    },
    {
      title: "Contactos",
      url: "/contacts",
      icon: Users,
    },
      {
        title: "Casos",
        url: "/cases",
        icon: Briefcase,
      },
      {
        title: "Escrituras",
        url: "/escrituras",
        icon: FileSignature,
      },
      {
        title: "Propuestas",
        url: "/proposals",
        icon: FileText,
      },
      {
        title: "Cuotas Recurrentes",
        url: "/recurring-fees",
        icon: Euro,
      },
      {
        title: "Suscripciones",
        url: "/subscriptions",
        icon: Package,
      },
      {
        title: "Suscripciones Pagadas",
        url: "/outgoing-subscriptions",
        icon: CreditCard,
      },
      {
        title: "Facturación Quantum",
        url: "/quantum/billing",
        icon: BarChart3,
      },
    ]
  },
  {
    title: "Productividad",
    items: [
      {
        title: "Tareas",
        url: "/tasks",
        icon: FileText,
      },
      {
        title: "Time Tracking",
        url: "/time-tracking",
        icon: Clock,
      },
      {
        title: "Calendario",
        url: "/calendar",
        icon: Calendar,
      },
      {
        title: "Salas",
        url: "/rooms",
        icon: Monitor,
      },
      {
        title: "Panel Ocupación",
        url: "/panel-ocupacion",
        icon: Grid3X3,
      },
      {
        title: "Equipos",
        url: "/equipment",
        icon: Package,
      },
      {
        title: "Documentos",
        url: "/documents",
        icon: FolderOpen,
      },
    ]
  },
  {
    title: "Configuración",
    items: [
      {
        title: "Usuarios del Sistema",
        url: "/system-users",
        icon: UserCog,
      },
      {
        title: "Integraciones",
        url: "/integrations",
        icon: Settings,
      },
      {
        title: "Reportes",
        url: "/reports",
        icon: BarChart3,
      },
    ]
  },
  {
    title: "IA & Academia",
    items: [
      {
        title: "Academia",
        url: "/academia",
        icon: BookOpen,
      },
      {
        title: "Admin Academia",
        url: "/academia/admin",
        icon: Wrench,
      },
      {
        title: "Asistente IA",
        url: "/ai-assistant",
        icon: Bot,
      },
      {
        title: "Admin IA",
        url: "/ai-admin",
        icon: Shield,
      },
    ]
  }
]

export const quickActions: QuickAction[] = [
  {
    name: "Nuevo Cliente",
    href: "/clients/new"
  },
  {
    name: "Nuevo Caso",
    href: "/cases/new"
  },
  {
    name: "Nueva Propuesta",
    href: "/proposals/new"
  },
  {
    name: "Nueva Cuota",
    href: "/recurring-fees"
  },
  {
    name: "Reservar Sala",
    href: "/rooms"
  },
  {
    name: "Registrar Tiempo",
    href: "/time-tracking"
  }
]
