
import { Bot } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAIAssistant } from '@/hooks/useAIAssistant'

export const AIAssistantSection = () => {
  const { toggle } = useAIAssistant()

  return (
    <div className="mt-6 pt-6 border-t border-gray-200">
      <Button
        variant="outline"
        size="sm"
        className="w-full justify-start"
        onClick={toggle}
      >
        <Bot className="mr-3 h-4 w-4" />
        Asistente IA
      </Button>
    </div>
  )
}
