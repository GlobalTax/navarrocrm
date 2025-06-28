
import { NavLink } from 'react-router-dom'
import { cn } from "@/lib/utils"
import { ChevronDown, Bot } from 'lucide-react'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useAIAssistant } from '@/hooks/useAIAssistant'

export const AIAssistantSection = () => {
  const [isAIOpen, setIsAIOpen] = useState(false)
  const { toggle: toggleAI } = useAIAssistant()

  return (
    <Collapsible open={isAIOpen} onOpenChange={setIsAIOpen}>
      <CollapsibleTrigger className="group flex items-center w-full px-2 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900 mt-4">
        <Bot className="mr-3 flex-shrink-0 h-6 w-6" />
        Asistente IA
        <ChevronDown className={cn(
          "ml-auto h-4 w-4 transition-transform",
          isAIOpen && "rotate-180"
        )} />
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-1 pl-6">
        <NavLink
          to="/ai-admin"
          className={({ isActive }) =>
            cn(
              isActive
                ? 'bg-gray-100 text-gray-900'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
              'group flex items-center px-2 py-2 text-sm font-medium rounded-md'
            )
          }
        >
          Administración IA
        </NavLink>
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleAI}
          className="w-full justify-start px-2 py-1.5 h-auto text-sm font-normal text-gray-600 hover:text-gray-900"
        >
          <Bot className="mr-2 h-4 w-4" />
          Abrir Chat IA
        </Button>
      </CollapsibleContent>
    </Collapsible>
  )
}
