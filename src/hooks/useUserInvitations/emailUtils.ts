
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
) => {
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 7)

  const invitationUrl = `${window.location.origin}/signup?token=${token}`
  const emailHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Has sido invitado a unirte a nuestra asesoría</h2>
      <p>Hola,</p>
      <p>Has sido invitado por <strong>${userEmail}</strong> para unirte a nuestra asesoría con el rol de <strong>${getRoleLabel(role)}</strong>.</p>
      ${message ? `<p><em>"${message}"</em></p>` : ''}
      <div style="margin: 30px 0;">
        <a href="${invitationUrl}" 
           style="background-color: #0061FF; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
          Aceptar Invitación
        </a>
      </div>
      <p>Este enlace expira el ${new Date(expiresAt).toLocaleDateString('es-ES')}.</p>
      <p>Si no esperabas esta invitación, puedes ignorar este email.</p>
      <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
      <p style="color: #666; font-size: 12px;">
        Si el botón no funciona, copia y pega este enlace en tu navegador:<br>
        <a href="${invitationUrl}">${invitationUrl}</a>
      </p>
    </div>
  `

  console.log('📧 Enviando email de invitación real a:', email)
  console.log('📧 URL de invitación:', invitationUrl)

  const { data: emailResponse, error: emailError } = await supabase.functions.invoke('send-email', {
    body: {
      to: email,
      subject: 'Invitación para unirte a nuestra asesoría',
      html: emailHtml,
      invitationToken: token,
      testMode: false
    }
  })

  console.log('📧 Respuesta del email de invitación:', { emailResponse, emailError })

  if (emailError) {
    console.error('❌ Error enviando email de invitación:', emailError)
    throw new Error(`Error enviando email: ${emailError.message}`)
  }

  console.log('✅ Email de invitación enviado correctamente')
}

export const sendReminderEmail = async (email: string, role: string, token: string) => {
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 7)

  const invitationUrl = `${window.location.origin}/signup?token=${token}`
  const emailHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Recordatorio: Invitación pendiente</h2>
      <p>Hola,</p>
      <p>Te recordamos que tienes una invitación pendiente para unirte a nuestra asesoría con el rol de <strong>${getRoleLabel(role)}</strong>.</p>
      <div style="margin: 30px 0;">
        <a href="${invitationUrl}" 
           style="background-color: #0061FF; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
          Aceptar Invitación
        </a>
      </div>
      <p>Este enlace expira el ${new Date(expiresAt).toLocaleDateString('es-ES')}.</p>
    </div>
  `

  console.log('📧 Reenviando email a:', email)

  const { data: emailResponse, error: emailError } = await supabase.functions.invoke('send-email', {
    body: {
      to: email,
      subject: 'Recordatorio: Invitación pendiente',
      html: emailHtml,
      invitationToken: token,
      testMode: false
    }
  })

  console.log('📧 Respuesta de reenvío:', { emailResponse, emailError })

  if (emailError) {
    console.error('❌ Error reenviando email:', emailError)
    throw new Error(`Error reenviando email: ${emailError.message}`)
  }

  console.log('✅ Email reenviado exitosamente')
}
