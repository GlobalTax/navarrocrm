
import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { 
  LayoutDashboard, 
  Users, 
  FolderOpen, 
  Clock,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  Calendar,
  FileText,
  Settings,
  HelpCircle
} from 'lucide-react'

const menuSections = [
  {
    title: 'Principal',
    items: [
      {
        title: 'Dashboard',
        icon: LayoutDashboard,
        href: '/dashboard',
        badge: null
      },
      {
        title: 'Clientes',
        icon: Users,
        href: '/clients',
        badge: null
      },
      {
        title: 'Casos',
        icon: FolderOpen,
        href: '/cases',
        badge: null
      }
    ]
  },
  {
    title: 'Tiempo & Facturación',
    items: [
      {
        title: 'Registro de Tiempo',
        icon: Clock,
        href: '/time-tracking',
        badge: null
      },
      {
        title: 'Calendario',
        icon: Calendar,
        href: '/calendar',
        badge: null
      },
      {
        title: 'Facturas',
        icon: DollarSign,
        href: '/invoices',
        badge: { text: 'Próximo', variant: 'secondary' as const }
      }
    ]
  },
  {
    title: 'Documentos',
    items: [
      {
        title: 'Plantillas',
        icon: FileText,
        href: '/templates',
        badge: { text: 'Próximo', variant: 'secondary' as const }
      }
    ]
  }
]

const bottomMenuItems = [
  {
    title: 'Configuración',
    icon: Settings,
    href: '/settings',
    badge: null
  },
  {
    title: 'Ayuda',
    icon: HelpCircle,
    href: '/help',
    badge: null
  }
]

export const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  const handleNavigation = (href: string) => {
    if (href.startsWith('/') && !href.includes('próximo')) {
      navigate(href)
    }
  }

  return (
    <div className={cn(
      "relative flex flex-col h-screen bg-white border-r border-gray-200 transition-all duration-300",
      collapsed ? "w-16" : "w-64"
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">CL</span>
            </div>
            <span className="text-lg font-semibold text-gray-900">CRM Legal</span>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 hover:bg-gray-100"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-6">
          {menuSections.map((section) => (
            <div key={section.title}>
              {!collapsed && (
                <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  {section.title}
                </h3>
              )}
              <div className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon
                  const isActive = location.pathname === item.href
                  const isDisabled = item.badge?.text === 'Próximo'

                  return (
                    <Button
                      key={item.href}
                      variant={isActive ? "default" : "ghost"}
                      className={cn(
                        "w-full justify-start gap-3 text-left px-3 py-2",
                        collapsed && "justify-center px-2",
                        isActive && "bg-blue-50 text-blue-700 hover:bg-blue-100",
                        isDisabled && "opacity-60 cursor-not-allowed"
                      )}
                      onClick={() => !isDisabled && handleNavigation(item.href)}
                      disabled={isDisabled}
                    >
                      <Icon className="h-5 w-5 flex-shrink-0" />
                      {!collapsed && (
                        <>
                          <span className="flex-1">{item.title}</span>
                          {item.badge && (
                            <Badge variant={item.badge.variant} className="text-xs">
                              {item.badge.text}
                            </Badge>
                          )}
                        </>
                      )}
                    </Button>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>
      </ScrollArea>

      {/* Footer */}
      <div className="p-3 border-t border-gray-100 space-y-1">
        {bottomMenuItems.map((item) => {
          const Icon = item.icon
          const isActive = location.pathname === item.href

          return (
            <Button
              key={item.href}
              variant={isActive ? "default" : "ghost"}
              className={cn(
                "w-full justify-start gap-3 text-left px-3 py-2",
                collapsed && "justify-center px-2",
                isActive && "bg-blue-50 text-blue-700"
              )}
              onClick={() => handleNavigation(item.href)}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              {!collapsed && <span>{item.title}</span>}
            </Button>
          )
        })}
        
        {!collapsed && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <div className="text-xs text-gray-600 text-center">
              <p className="font-medium">CRM Legal Pro</p>
              <p>v1.0.0</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
