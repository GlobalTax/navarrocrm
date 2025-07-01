
import { useState } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useApp } from '@/contexts/AppContext'
import { WhatsAppConfig } from './types'

export const useWhatsAppConfig = () => {
  const { user } = useApp()
  const [config, setConfig] = useState<WhatsAppConfig | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Cargar configuración
  const loadConfig = async () => {
    if (!user?.org_id) return

    try {
      const { data, error } = await supabase
        .from('whatsapp_config')
        .select('*')
        .eq('org_id', user.org_id)
        .maybeSingle()

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
        org_id: user.org_id,
        phone_number: configData.phone_number || '',
        business_account_id: configData.business_account_id || '',
        access_token: configData.access_token || '',
        webhook_verify_token: configData.webhook_verify_token || '',
        is_active: configData.is_active ?? false,
        auto_reminders: configData.auto_reminders ?? true,
        appointment_confirms: configData.appointment_confirms ?? true,
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
            .insert({
              ...payload,
              created_at: new Date().toISOString()
            })
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

  return {
    config,
    error,
    loadConfig,
    saveConfig,
    isConnected: !!config?.is_active
  }
}
