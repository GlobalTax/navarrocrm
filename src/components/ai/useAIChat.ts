
import { useState } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useApp } from '@/contexts/AppContext'
import { toast } from 'sonner'
import { Message } from './types'

export const useAIChat = () => {
  const { user } = useApp()
  
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
  const [isLoading, setIsLoading] = useState(false)

  const sendMessage = async (content: string) => {
    console.log('📤 AIChat - Enviando mensaje:', content)
    
    if (!content.trim() || isLoading) {
      console.log('⚠️ AIChat - Mensaje bloqueado. Contenido vacío o cargando')
      return
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setIsLoading(true)

    try {
      console.log('🚀 AIChat - Llamando a función Edge...')
      
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

      console.log('📥 AIChat - Respuesta recibida:', response)

      if (response.error) {
        console.error('❌ AIChat - Error en respuesta:', response.error)
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
      console.error('💥 AIChat - Error al enviar mensaje:', error)
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
    console.log('🎬 AIChat - Ejecutando acción IA:', action)
  }

  return {
    messages,
    isLoading,
    sendMessage
  }
}
