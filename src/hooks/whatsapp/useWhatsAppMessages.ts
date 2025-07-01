
import { useState } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useApp } from '@/contexts/AppContext'
import { WhatsAppMessage, WhatsAppConfig } from './types'

export const useWhatsAppMessages = () => {
  const { user } = useApp()
  const [messages, setMessages] = useState<WhatsAppMessage[]>([])
  const [error, setError] = useState<string | null>(null)

  // Enviar mensaje
  const sendMessage = async (
    phoneNumber: string,
    content: string,
    contactId?: string,
    templateName?: string,
    config?: WhatsAppConfig | null
  ) => {
    if (!user?.org_id || !config) return

    try {
      // Crear registro de mensaje
      const messageData = {
        org_id: user.org_id,
        contact_id: contactId || null,
        phone_number: phoneNumber,
        message_type: (templateName ? 'template' : 'text') as 'text' | 'template' | 'media',
        content,
        template_name: templateName || null,
        status: 'pending' as 'pending' | 'sent' | 'delivered' | 'read' | 'failed',
        created_at: new Date().toISOString()
      }

      const { data: messageRecord, error: dbError } = await supabase
        .from('whatsapp_messages')
        .insert(messageData)
        .select()
        .single()

      if (dbError) throw dbError

      // Llamar al edge function para enviar el mensaje
      const { data, error: functionError } = await supabase.functions.invoke('send-whatsapp', {
        body: {
          phoneNumber,
          content,
          templateName,
          messageId: messageRecord.id
        }
      })

      if (functionError) throw functionError

      // Actualizar estado del mensaje
      const { error: updateError } = await supabase
        .from('whatsapp_messages')
        .update({
          status: 'sent',
          whatsapp_message_id: data?.messageId,
          sent_at: new Date().toISOString()
        })
        .eq('id', messageRecord.id)

      if (updateError) throw updateError

      // Actualizar la lista de mensajes local
      await loadMessages()

      return messageRecord
    } catch (err: any) {
      console.error('Error sending WhatsApp message:', err)
      setError(err.message)
      throw err
    }
  }

  // Cargar mensajes
  const loadMessages = async () => {
    if (!user?.org_id) return

    try {
      const { data, error } = await supabase
        .from('whatsapp_messages')
        .select('*')
        .eq('org_id', user.org_id)
        .order('created_at', { ascending: false })
        .limit(100)

      if (error) throw error

      // Convertir los datos de la base de datos al tipo correcto
      const typedMessages: WhatsAppMessage[] = (data || []).map(msg => ({
        id: msg.id,
        org_id: msg.org_id,
        contact_id: msg.contact_id,
        phone_number: msg.phone_number,
        message_type: msg.message_type as 'text' | 'template' | 'media',
        content: msg.content,
        template_name: msg.template_name,
        status: msg.status as 'pending' | 'sent' | 'delivered' | 'read' | 'failed',
        whatsapp_message_id: msg.whatsapp_message_id,
        created_at: msg.created_at,
        sent_at: msg.sent_at
      }))

      setMessages(typedMessages)
    } catch (err: any) {
      console.error('Error loading WhatsApp messages:', err)
      setError(err.message)
    }
  }

  return {
    messages,
    error,
    sendMessage,
    loadMessages
  }
}
