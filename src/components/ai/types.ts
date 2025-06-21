
export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  suggestions?: string[]
}

export interface AIAssistantProps {
  isOpen: boolean
  onToggle: () => void
  onMinimize: () => void
  isMinimized: boolean
}

export interface QuickAction {
  icon: React.ComponentType<{ className?: string }>
  label: string
  prompt: string
}
