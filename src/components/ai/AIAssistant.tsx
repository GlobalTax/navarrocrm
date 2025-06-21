
import { useState, useRef, useEffect, FormEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Bot, 
  User, 
  Sparkles,
  Users,
  FileText,
  Calendar,
  Send,
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
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  suggestions?: string[]
}

interface AIAssistantProps {
  isOpen: boolean
  onToggle: () => void
  onMinimize: () => void
  isMinimized: boolean
}

const QUICK_ACTIONS = [
  {
    icon: Users,
    label: 'Crear cliente',
    prompt: 'Ayúdame a crear un nuevo cliente paso a paso'
  },
  {
    icon: FileText,
    label: 'Buscar expediente',
    prompt: 'Quiero buscar información sobre un expediente específico'
  },
  {
    icon: Calendar,
    label: 'Agendar cita',
    prompt: 'Necesito programar una cita con un cliente'
  }
]

export const AIAssistant = ({ isOpen, onToggle, onMinimize, isMinimized }: AIAssistantProps) => {
  const { user } = useAuth()
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: '¡Hola! Soy tu asistente de IA para el despacho jurídico. Puedo ayudarte con tareas como crear clientes, buscar expedientes, programar citas y mucho más. ¿En qué puedo ayudarte hoy?',
      timestamp: new Date(),
      suggestions: [
        'Crear un nuevo cliente',
        'Buscar expedientes',
        'Ver estadísticas de clientes',
        'Programar una cita'
      ]
    }
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const sendMessage = async (content: string) => {
    console.log('📤 AIAssistant - Enviando mensaje:', content)
    
    if (!content.trim() || isLoading) {
      console.log('⚠️ AIAssistant - Mensaje bloqueado. Contenido vacío o cargando')
      return
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsLoading(true)

    try {
      console.log('🚀 AIAssistant - Llamando a función Edge...')
      
      const response = await supabase.functions.invoke('ai-assistant', {
        body: {
          message: content.trim(),
          context: {
            user_id: user?.id,
            org_id: user?.org_id,
            current_page: window.location.pathname
          },
          conversation_history: messages.slice(-5)
        }
      })

      console.log('📥 AIAssistant - Respuesta recibida:', response)

      if (response.error) {
        console.error('❌ AIAssistant - Error en respuesta:', response.error)
        throw new Error(response.error.message)
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.data.response,
        timestamp: new Date(),
        suggestions: response.data.suggestions
      }

      setMessages(prev => [...prev, assistantMessage])

      if (response.data.action) {
        handleAIAction(response.data.action)
      }

    } catch (error) {
      console.error('💥 AIAssistant - Error al enviar mensaje:', error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Lo siento, ha ocurrido un error al procesar tu mensaje. Por favor, inténtalo de nuevo.',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
      toast.error('Error al comunicarse con el asistente')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAIAction = (action: any) => {
    console.log('🎬 AIAssistant - Ejecutando acción IA:', action)
  }

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
  }

  if (!isOpen) {
    return null
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
        {/* Acciones rápidas */}
        {messages.length <= 1 && (
          <div className="p-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
            <p className="text-xs text-blue-700 mb-2 font-medium">🚀 Acciones rápidas:</p>
            <div className="flex flex-wrap gap-2">
              {QUICK_ACTIONS.map((action) => (
                <Button
                  key={action.label}
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickAction(action.prompt)}
                  className="text-xs border-blue-200 hover:bg-blue-50 hover:border-blue-300"
                  disabled={isLoading}
                >
                  <action.icon className="h-3 w-3 mr-1" />
                  {action.label}
                </Button>
              ))}
            </div>
          </div>
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

              {/* Sugerencias */}
              {message.role === 'assistant' && message.suggestions && (
                <div className="ml-10 space-y-1">
                  <p className="text-xs text-gray-500">💡 Sugerencias:</p>
                  <div className="flex flex-wrap gap-1">
                    {message.suggestions.map((suggestion, index) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="cursor-pointer hover:bg-blue-50 hover:border-blue-300 text-xs"
                        onClick={() => handleSuggestionClick(suggestion)}
                      >
                        {suggestion}
                      </Badge>
                    ))}
                  </div>
                </div>
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
