
import { useEffect } from 'react'
import { useApp } from '@/contexts/AppContext'
import { useWhatsAppConfig } from './whatsapp/useWhatsAppConfig'
import { useWhatsAppMessages } from './whatsapp/useWhatsAppMessages'
import { useWhatsAppStats } from './whatsapp/useWhatsAppStats'

export const useWhatsAppIntegration = () => {
  const { user } = useApp()
  const {
    config,
    error: configError,
    loadConfig,
    saveConfig,
    isConnected
  } = useWhatsAppConfig()

  const {
    messages,
    error: messagesError,
    sendMessage: sendMessageBase,
    loadMessages
  } = useWhatsAppMessages()

  const { getStats } = useWhatsAppStats(messages)

  // Wrapper para sendMessage que incluye la config
  const sendMessage = async (
    phoneNumber: string,
    content: string,
    contactId?: string,
    templateName?: string
  ) => {
    return sendMessageBase(phoneNumber, content, contactId, templateName, config)
  }

  const error = configError || messagesError

  useEffect(() => {
    const initialize = async () => {
      await loadConfig()
      await loadMessages()
    }

    if (user?.org_id) {
      initialize()
    }
  }, [user?.org_id])

  return {
    config,
    messages,
    isLoading: false, // Se mantiene la compatibilidad pero se simplifica
    error,
    saveConfig,
    sendMessage,
    loadMessages,
    getStats,
    isConnected
  }
}

// Re-exportar tipos para compatibilidad
export type { WhatsAppConfig, WhatsAppMessage } from './whatsapp/types'
