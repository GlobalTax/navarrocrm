
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
