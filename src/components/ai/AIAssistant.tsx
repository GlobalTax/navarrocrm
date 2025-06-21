
import { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { 
  MessageCircle, 
  Send, 
  Minimize2, 
  Maximize2, 
  X, 
  Bot, 
  User, 
  Sparkles,
  Users,
  FileText,
  Calendar,
  AlertCircle
} from 'lucide-react'
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
  const [debugInfo, setDebugInfo] = useState<string>('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    console.log('🔍 AIAssistant - isOpen:', isOpen, 'isMinimized:', isMinimized)
    if (isOpen && !isMinimized) {
      console.log('🎯 AIAssistant - Intentando enfocar input...')
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus()
          console.log('✅ AIAssistant - Input enfocado')
        } else {
          console.log('❌ AIAssistant - Input ref no disponible')
        }
      }, 100)
    }
  }, [isOpen, isMinimized])

  const sendMessage = async (content: string) => {
    console.log('📤 AIAssistant - Enviando mensaje:', content)
    console.log('📊 AIAssistant - Estado actual - isLoading:', isLoading, 'content.trim():', content.trim())
    
    if (!content.trim() || isLoading) {
      console.log('⚠️ AIAssistant - Mensaje bloqueado. Contenido vacío o cargando')
      setDebugInfo(`Bloqueado: contenido="${content.trim()}", isLoading=${isLoading}`)
      return
    }

    setDebugInfo('Enviando mensaje...')

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
      setDebugInfo('Conectando con IA...')
      
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
      setDebugInfo('¡Mensaje enviado correctamente!')

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
      setDebugInfo(`Error: ${error instanceof Error ? error.message : 'Error desconocido'}`)
    } finally {
      setIsLoading(false)
      console.log('✅ AIAssistant - Proceso completado, isLoading ahora es false')
      // Volver a enfocar el input después de enviar
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus()
          console.log('🎯 AIAssistant - Input reenfocado después de envío')
        }
      }, 100)
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('📝 AIAssistant - Submit formulario, mensaje:', inputMessage)
    sendMessage(inputMessage)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    console.log('⌨️ AIAssistant - Cambio en input:', value)
    setInputMessage(value)
    setDebugInfo(`Escribiendo: "${value}"`)
  }

  const handleInputFocus = () => {
    console.log('🎯 AIAssistant - Input enfocado por usuario')
    setDebugInfo('Campo de texto activo')
  }

  const handleInputBlur = () => {
    console.log('👋 AIAssistant - Input perdió el foco')
  }

  // Test simple para verificar si el componente responde
  const testFunction = () => {
    console.log('🧪 AIAssistant - Función de test ejecutada')
    setDebugInfo('Test ejecutado - el componente responde')
    toast.success('Test: El componente funciona correctamente')
  }

  if (isMinimized) {
    return (
      <Card className="fixed bottom-4 right-4 w-80 shadow-xl border-2 border-blue-200 z-50 bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardHeader className="pb-3 bg-gradient-to-r from-blue-600 to-indigo-600">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-white">
              <div className="h-3 w-3 bg-green-400 rounded-full animate-pulse shadow-lg" />
              <CardTitle className="text-sm font-semibold">🤖 Asistente Jurídico IA</CardTitle>
            </div>
            <div className="flex gap-1">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onToggle}
                className="text-white hover:bg-white/20 h-7 w-7 p-0"
              >
                <Maximize2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Sparkles className="h-6 w-6 text-blue-600 animate-pulse" />
            </div>
            <p className="text-sm text-gray-700 font-medium">¿Necesitas ayuda?</p>
            <p className="text-xs text-gray-500 mb-3">Haz clic para expandir el chat</p>
            <Button 
              onClick={onToggle} 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium"
              size="sm"
            >
              💬 Abrir Chat
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="fixed bottom-4 right-4 w-96 h-[600px] shadow-xl border-2 border-blue-200 z-50 flex flex-col bg-white">
      <CardHeader className="pb-2 border-b bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8 border-2 border-white">
              <AvatarFallback className="bg-white text-blue-700 font-bold">
                <Bot className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-sm font-semibold">🤖 Asistente Jurídico IA</CardTitle>
              <div className="flex items-center gap-1">
                <div className="h-2 w-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-xs text-blue-100">Siempre disponible</span>
              </div>
            </div>
          </div>
          <div className="flex gap-1">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={testFunction}
              className="text-white hover:bg-white/20 h-7 w-7 p-0"
              title="Test de funcionalidad"
            >
              <AlertCircle className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onMinimize}
              className="text-white hover:bg-white/20 h-7 w-7 p-0"
            >
              <Minimize2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
        {/* Debug info */}
        {debugInfo && (
          <div className="px-4 py-2 bg-yellow-50 border-b text-xs text-yellow-800">
            🔧 Debug: {debugInfo}
          </div>
        )}

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

        {/* Mensajes */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div key={message.id} className="space-y-2">
                <div
                  className={`flex gap-3 ${
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {message.role === 'assistant' && (
                    <Avatar className="h-6 w-6 border border-blue-200">
                      <AvatarFallback className="bg-blue-100 text-blue-700">
                        <Bot className="h-3 w-3" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                  
                  <div
                    className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                      message.role === 'user'
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-900 border border-gray-200'
                    }`}
                  >
                    {message.content}
                  </div>

                  {message.role === 'user' && (
                    <Avatar className="h-6 w-6 border border-gray-200">
                      <AvatarFallback className="bg-gray-200 text-gray-700">
                        <User className="h-3 w-3" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>

                {/* Sugerencias */}
                {message.role === 'assistant' && message.suggestions && (
                  <div className="ml-9 space-y-1">
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
              <div className="flex items-center gap-3">
                <Avatar className="h-6 w-6 border border-blue-200">
                  <AvatarFallback className="bg-blue-100 text-blue-700">
                    <Bot className="h-3 w-3" />
                  </AvatarFallback>
                </Avatar>
                <div className="bg-gray-100 rounded-lg px-3 py-2 border border-gray-200">
                  <div className="flex items-center gap-1 text-blue-600">
                    <div className="animate-bounce">●</div>
                    <div className="animate-bounce" style={{ animationDelay: '0.1s' }}>●</div>
                    <div className="animate-bounce" style={{ animationDelay: '0.2s' }}>●</div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Input de mensaje */}
        <div className="p-4 border-t bg-gray-50">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              ref={inputRef}
              value={inputMessage}
              onChange={handleInputChange}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
              placeholder={isLoading ? "Procesando..." : "Escribe tu pregunta aquí..."}
              disabled={isLoading}
              className={`flex-1 border-blue-200 focus:border-blue-400 ${
                isLoading ? 'bg-gray-100' : 'bg-white'
              }`}
            />
            <Button 
              type="submit" 
              disabled={!inputMessage.trim() || isLoading}
              size="sm"
              className={`${
                isLoading 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isLoading ? (
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </form>
          <div className="flex items-center justify-between mt-2">
            <p className="text-xs text-gray-500 flex items-center gap-1">
              <Sparkles className="h-3 w-3" />
              Asistente IA - Siempre aquí para ayudarte
            </p>
            {(isLoading || debugInfo) && (
              <div className="flex items-center gap-1 text-xs">
                {isLoading && (
                  <div className="h-2 w-2 bg-orange-500 rounded-full animate-pulse" />
                )}
                <span className="text-gray-400">
                  {isLoading ? 'Pensando...' : 'Listo'}
                </span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
