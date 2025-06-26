
import { NavLink } from 'react-router-dom'
import { cn } from "@/lib/utils"
import { ChevronDown, BarChart3, Brain, TrendingUp } from 'lucide-react'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { useState } from 'react'

export const AnalyticsSection = () => {
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false)

  return (
    <Collapsible open={isAnalyticsOpen} onOpenChange={setIsAnalyticsOpen}>
      <CollapsibleTrigger className="group flex items-center w-full px-2 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900 mt-4">
        <BarChart3 className="mr-3 flex-shrink-0 h-6 w-6" />
        Analytics
        <ChevronDown className={cn(
          "ml-auto h-4 w-4 transition-transform",
          isAnalyticsOpen && "rotate-180"
        )} />
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-1 pl-6">
        <NavLink
          to="/intelligent-dashboard"
          className={({ isActive }) =>
            cn(
              isActive
                ? 'bg-gray-100 text-gray-900'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
              'group flex items-center px-2 py-2 text-sm font-medium rounded-md'
            )
          }
        >
          <TrendingUp className="mr-2 h-4 w-4" />
          Dashboard Inteligente
        </NavLink>
        <NavLink
          to="/predictive-analytics"
          className={({ isActive }) =>
            cn(
              isActive
                ? 'bg-gray-100 text-gray-900'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
              'group flex items-center px-2 py-2 text-sm font-medium rounded-md'
            )
          }
        >
          <Brain className="mr-2 h-4 w-4" />
          Analytics Predictivo
        </NavLink>
      </CollapsibleContent>
    </Collapsible>
  )
}
