
import { useState } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useApp } from '@/contexts/AppContext'
import { toast } from 'sonner'
import { Message } from './types'
import { aiLogger } from '@/utils/logging'
import type { AIAction } from '@/types/features/ai'

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
    aiLogger.info('Enviando mensaje', { contentLength: content.length, userId: user?.id })
    
    if (!content.trim() || isLoading) {
      aiLogger.warn('Mensaje bloqueado', { 
        reason: !content.trim() ? 'contenido_vacio' : 'cargando',
        isLoading 
      })
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
      aiLogger.info('Llamando función Edge', { 
        userId: user?.id, 
        orgId: user?.org_id,
        currentPage: window.location.pathname 
      })
      
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

      aiLogger.info('Respuesta recibida', { 
        hasData: !!response.data,
        hasError: !!response.error 
      })

      if (response.error) {
        aiLogger.error('Error en respuesta de Edge Function', { 
          error: response.error.message,
          userId: user?.id 
        })
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
      aiLogger.error('Error al enviar mensaje', { 
        error: error instanceof Error ? error.message : 'Unknown error',
        userId: user?.id,
        messageLength: content.length 
      })
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

  const handleAIAction = (action: AIAction) => {
    aiLogger.info('Ejecutando acción IA', { 
      actionType: action.type,
      hasPayload: !!action.payload,
      userId: user?.id 
    })
  }

  return {
    messages,
    isLoading,
    sendMessage
  }
}
