
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

interface EmailError extends Error {
  details?: {
    errorCode: string
    userMessage: string
    originalError?: string
  }
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
    
    // Si la respuesta indica un error específico (pero no lanzó excepción)
    if (data && !data.success && data.error) {
      const errorObj: EmailError = new Error(data.userMessage || data.error)
      errorObj.details = {
        errorCode: data.errorCode,
        userMessage: data.userMessage,
        originalError: data.error
      }
      throw errorObj
    }
    
    console.log('✅ Email de invitación enviado exitosamente:', data)
  } catch (error: any) {
    console.error('❌ Error crítico enviando email de invitación:', error)
    
    // Si ya tiene detalles específicos, los preservamos
    if (error.details) {
      throw error
    }
    
    // Si no, creamos una estructura de error genérica
    const errorObj: EmailError = new Error(error.message || 'Error desconocido enviando email')
    errorObj.details = {
      errorCode: 'EMAIL_SEND_FAILED',
      userMessage: error.message || 'Error desconocido enviando email',
      originalError: error.message
    }
    throw errorObj
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

    // Si la respuesta indica un error específico (pero no lanzó excepción)
    if (data && !data.success && data.error) {
      const errorObj: EmailError = new Error(data.userMessage || data.error)
      errorObj.details = {
        errorCode: data.errorCode,
        userMessage: data.userMessage,
        originalError: data.error
      }
      throw errorObj
    }

    console.log('✅ Email de recordatorio enviado exitosamente:', data)
  } catch (error: any) {
    console.error('❌ Error crítico reenviando email:', error)
    
    // Si ya tiene detalles específicos, los preservamos
    if (error.details) {
      throw error
    }
    
    // Si no, creamos una estructura de error genérica
    const errorObj: EmailError = new Error(error.message || 'Error desconocido reenviando email')
    errorObj.details = {
      errorCode: 'EMAIL_SEND_FAILED',
      userMessage: error.message || 'Error desconocido reenviando email',
      originalError: error.message
    }
    throw errorObj
  }
}
