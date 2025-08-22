
import { supabase } from '@/integrations/supabase/client'

export const getRoleLabel = (role: string) => {
  const labels = {
    partner: 'Partner',
    area_manager: 'Area Manager',
    senior: 'Senior',
    junior: 'Junior',
    finance: 'Finanzas'
  }
  return labels[role as keyof typeof labels] || role
}

export const sendInvitationEmail = async (
  email: string, 
  role: string, 
  token: string, 
  userEmail: string, 
  message?: string
): Promise<void> => {
  try {
    console.log('📧 Iniciando envío de email de invitación:', {
      email,
      role,
      hasToken: !!token,
      invitedBy: userEmail
    })
    
    const { data, error } = await supabase.functions.invoke('send-invitation-email', {
      body: {
        email,
        role,
        token,
        invitedByEmail: userEmail,
        message
      }
    })
    
    if (error) {
      console.error('❌ Error en edge function:', error)
      throw new Error(`Error del servicio de email: ${error.message}`)
    }
    
    console.log('✅ Email de invitación enviado exitosamente:', data)
  } catch (error: any) {
    console.error('❌ Error crítico enviando email de invitación:', error)
    throw error
  }
}

export const sendReminderEmail = async (email: string, role: string, token: string): Promise<void> => {
  try {
    console.log('📧 Reenviando invitación a:', email)

    const { data, error } = await supabase.functions.invoke('send-invitation-email', {
      body: {
        email,
        role,
        token,
        invitedByEmail: 'Sistema',
        message: 'Este es un recordatorio de tu invitación pendiente.'
      }
    })

    if (error) {
      console.error('❌ Error reenviando invitación:', error)
      throw new Error(`Error del servicio de email: ${error.message}`)
    }

    console.log('✅ Email de recordatorio enviado exitosamente:', data)
  } catch (error: any) {
    console.error('❌ Error crítico reenviando email:', error)
    throw error
  }
}
