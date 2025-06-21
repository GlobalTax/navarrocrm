
import { Badge } from '@/components/ui/badge'

interface ChatSuggestionsProps {
  suggestions: string[]
  onSuggestionClick: (suggestion: string) => void
}

export const ChatSuggestions = ({ suggestions, onSuggestionClick }: ChatSuggestionsProps) => {
  return (
    <div className="ml-10 space-y-1">
      <p className="text-xs text-gray-500">💡 Sugerencias:</p>
      <div className="flex flex-wrap gap-1">
        {suggestions.map((suggestion, index) => (
          <Badge
            key={index}
            variant="outline"
            className="cursor-pointer hover:bg-blue-50 hover:border-blue-300 text-xs"
            onClick={() => onSuggestionClick(suggestion)}
          >
            {suggestion}
          </Badge>
        ))}
      </div>
    </div>
  )
}
