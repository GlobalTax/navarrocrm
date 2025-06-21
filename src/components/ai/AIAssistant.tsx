
import { useState, FormEvent } from 'react'
import { 
  Bot, 
  Sparkles,
  CornerDownLeft
} from 'lucide-react'
import { 
  ExpandableChat,
  ExpandableChatHeader,
  ExpandableChatBody,
  ExpandableChatFooter,
} from '@/components/ui/expandable-chat'
import {
  ChatBubble,
  ChatBubbleAvatar,
  ChatBubbleMessage,
} from '@/components/ui/chat-bubble'
import { ChatInput } from '@/components/ui/chat-input'
import { ChatMessageList } from '@/components/ui/chat-message-list'
import { Button } from '@/components/ui/button'
import { QuickActions } from './QuickActions'
import { ChatSuggestions } from './ChatSuggestions'
import { useAIChat } from './useAIChat'
import { AIAssistantProps } from './types'

export const AIAssistant = ({ isOpen, onToggle, onMinimize, isMinimized }: AIAssistantProps) => {
  const { messages, isLoading, sendMessage } = useAIChat()
  const [inputMessage, setInputMessage] = useState('')

  const handleSuggestionClick = (suggestion: string) => {
    console.log('💡 AIAssistant - Clic en sugerencia:', suggestion)
    sendMessage(suggestion)
  }

  const handleQuickAction = (prompt: string) => {
    console.log('⚡ AIAssistant - Acción rápida:', prompt)
    sendMessage(prompt)
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    console.log('📝 AIAssistant - Submit formulario, mensaje:', inputMessage)
    sendMessage(inputMessage)
    setInputMessage('')
  }

  return (
    <ExpandableChat
      size="lg"
      position="bottom-right"
      icon={<Bot className="h-6 w-6" />}
    >
      <ExpandableChatHeader className="flex-col text-center justify-center bg-gradient-to-r from-blue-600 to-indigo-600">
        <div className="flex items-center justify-center gap-2 text-white">
          <Bot className="h-6 w-6" />
          <h1 className="text-lg font-semibold">🤖 Asistente Jurídico IA</h1>
        </div>
        <div className="flex items-center justify-center gap-1 mt-1">
          <div className="h-2 w-2 bg-green-400 rounded-full animate-pulse" />
          <p className="text-sm text-blue-100">Siempre disponible para ayudarte</p>
        </div>
      </ExpandableChatHeader>

      <ExpandableChatBody>
        {/* Quick Actions */}
        {messages.length <= 1 && (
          <QuickActions
            onActionClick={handleQuickAction}
            isLoading={isLoading}
          />
        )}

        <ChatMessageList>
          {messages.map((message) => (
            <div key={message.id} className="space-y-2">
              <ChatBubble variant={message.role === 'user' ? 'sent' : 'received'}>
                <ChatBubbleAvatar
                  src={message.role === 'user' ? undefined : undefined}
                  fallback={message.role === 'user' ? 'TU' : 'IA'}
                  className="h-8 w-8"
                />
                <ChatBubbleMessage variant={message.role === 'user' ? 'sent' : 'received'}>
                  {message.content}
                </ChatBubbleMessage>
              </ChatBubble>

              {/* Suggestions */}
              {message.role === 'assistant' && message.suggestions && (
                <ChatSuggestions
                  suggestions={message.suggestions}
                  onSuggestionClick={handleSuggestionClick}
                />
              )}
            </div>
          ))}
          
          {isLoading && (
            <ChatBubble variant="received">
              <ChatBubbleAvatar fallback="IA" className="h-8 w-8" />
              <ChatBubbleMessage isLoading />
            </ChatBubble>
          )}
        </ChatMessageList>
      </ExpandableChatBody>

      <ExpandableChatFooter>
        <form
          onSubmit={handleSubmit}
          className="relative rounded-lg border bg-background focus-within:ring-1 focus-within:ring-ring p-1"
        >
          <ChatInput
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder={isLoading ? "Procesando..." : "Escribe tu pregunta aquí..."}
            disabled={isLoading}
            className="min-h-12 resize-none rounded-lg bg-background border-0 p-3 shadow-none focus-visible:ring-0"
          />
          <div className="flex items-center p-3 pt-0 justify-between">
            <div className="flex items-center gap-1 text-xs">
              <Sparkles className="h-3 w-3 text-blue-600" />
              <span className="text-gray-500">
                {isLoading ? 'Pensando...' : 'Asistente IA listo'}
              </span>
            </div>
            <Button 
              type="submit" 
              size="sm" 
              className="ml-auto gap-1.5"
              disabled={!inputMessage.trim() || isLoading}
            >
              {isLoading ? (
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
              ) : (
                <>
                  Enviar
                  <CornerDownLeft className="size-3.5" />
                </>
              )}
            </Button>
          </div>
        </form>
      </ExpandableChatFooter>
    </ExpandableChat>
  )
}
