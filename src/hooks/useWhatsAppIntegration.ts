
import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useApp } from '@/contexts/AppContext'

export interface WhatsAppConfig {
  id?: string
  org_id: string
  phone_number: string
  business_account_id: string
  access_token: string
  webhook_verify_token: string
  is_active: boolean
  auto_reminders: boolean
  appointment_confirms: boolean
  created_at?: string
  updated_at?: string
}

export interface WhatsAppMessage {
  id: string
  org_id: string
  contact_id?: string
  phone_number: string
  message_type: 'text' | 'template' | 'media'
  content: string
  template_name?: string
  status: 'pending' | 'sent' | 'delivered' | 'read' | 'failed'
  whatsapp_message_id?: string
  created_at: string
  sent_at?: string
}

export const useWhatsAppIntegration = () => {
  const { user } = useApp()
  const [config, setConfig] = useState<WhatsAppConfig | null>(null)
  const [messages, setMessages] = useState<WhatsAppMessage[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Cargar configuración
  const loadConfig = async () => {
    if (!user?.org_id) return

    try {
      const { data, error } = await supabase
        .from('whatsapp_config')
        .select('*')
        .eq('org_id', user.org_id)
        .single()

      if (error && error.code !== 'PGRST116') {
        throw error
      }

      setConfig(data)
    } catch (err: any) {
      console.error('Error loading WhatsApp config:', err)
      setError(err.message)
    }
  }

  // Guardar configuración
  const saveConfig = async (configData: Partial<WhatsAppConfig>) => {
    if (!user?.org_id) return

    try {
      const payload = {
        ...configData,
        org_id: user.org_id,
        updated_at: new Date().toISOString()
      }

      const { data, error } = config
        ? await supabase
            .from('whatsapp_config')
            .update(payload)
            .eq('id', config.id)
            .select()
            .single()
        : await supabase
            .from('whatsapp_config')
            .insert([{ ...payload, created_at: new Date().toISOString() }])
            .select()
            .single()

      if (error) throw error

      setConfig(data)
      return data
    } catch (err: any) {
      console.error('Error saving WhatsApp config:', err)
      setError(err.message)
      throw err
    }
  }

  // Enviar mensaje
  const sendMessage = async (
    phoneNumber: string,
    content: string,
    contactId?: string,
    templateName?: string
  ) => {
    if (!user?.org_id || !config) return

    try {
      // Crear registro de mensaje
      const messageData = {
        org_id: user.org_id,
        contact_id: contactId,
        phone_number: phoneNumber,
        message_type: templateName ? 'template' : 'text',
        content,
        template_name: templateName,
        status: 'pending' as const,
        created_at: new Date().toISOString()
      }

      const { data: messageRecord, error: dbError } = await supabase
        .from('whatsapp_messages')
        .insert([messageData])
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

      setMessages(data || [])
    } catch (err: any) {
      console.error('Error loading WhatsApp messages:', err)
      setError(err.message)
    }
  }

  // Estadísticas
  const getStats = () => {
    const totalSent = messages.filter(m => m.status === 'sent' || m.status === 'delivered').length
    const totalDelivered = messages.filter(m => m.status === 'delivered').length
    const totalRead = messages.filter(m => m.status === 'read').length
    const deliveryRate = totalSent > 0 ? (totalDelivered / totalSent) * 100 : 0

    return {
      totalSent,
      totalDelivered,
      totalRead,
      deliveryRate: Math.round(deliveryRate)
    }
  }

  useEffect(() => {
    const initialize = async () => {
      setIsLoading(true)
      await loadConfig()
      await loadMessages()
      setIsLoading(false)
    }

    initialize()
  }, [user?.org_id])

  return {
    config,
    messages,
    isLoading,
    error,
    saveConfig,
    sendMessage,
    loadMessages,
    getStats,
    isConnected: !!config?.is_active
  }
}
