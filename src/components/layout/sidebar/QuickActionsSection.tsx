
import { NavLink } from 'react-router-dom'
import { cn } from "@/lib/utils"
import { ChevronDown } from 'lucide-react'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { useState } from 'react'
import { quickActions } from './NavigationData'

export const QuickActionsSection = () => {
  const [isQuickActionsOpen, setIsQuickActionsOpen] = useState(false)

  return (
    <Collapsible open={isQuickActionsOpen} onOpenChange={setIsQuickActionsOpen}>
      <CollapsibleTrigger className="group flex items-center w-full px-2 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900 mt-4">
        Acciones Rápidas
        <ChevronDown className={cn(
          "ml-auto h-4 w-4 transition-transform",
          isQuickActionsOpen && "rotate-180"
        )} />
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-1 pl-6">
        {quickActions.map((action) => (
          <NavLink
            key={action.name}
            to={action.href}
            className={({ isActive }) =>
              cn(
                isActive
                  ? 'bg-gray-100 text-gray-900'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                'group flex items-center px-2 py-2 text-sm font-medium rounded-md'
              )
            }
          >
            {action.name}
          </NavLink>
        ))}
      </CollapsibleContent>
    </Collapsible>
  )
}
