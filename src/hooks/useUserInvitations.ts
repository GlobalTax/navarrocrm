
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useApp } from '@/contexts/AppContext'
import { toast } from 'sonner'

export interface UserInvitation {
  id: string
  org_id: string
  email: string
  role: string
  token: string
  expires_at: string
  invited_by: string
  accepted_at?: string
  created_at: string
  updated_at: string
  status: 'pending' | 'accepted' | 'expired' | 'cancelled'
}

export const useUserInvitations = () => {
  const { user } = useApp()
  const queryClient = useQueryClient()

  const { data: invitations = [], isLoading } = useQuery({
    queryKey: ['user-invitations', user?.org_id],
    queryFn: async () => {
      if (!user?.org_id) return []
      
      const { data, error } = await supabase
        .from('user_invitations')
        .select('*')
        .eq('org_id', user.org_id)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    },
    enabled: !!user?.org_id,
  })

  const sendInvitation = useMutation({
    mutationFn: async ({ email, role, message }: { email: string; role: string; message?: string }) => {
      if (!user?.org_id) throw new Error('No hay organización disponible')

      console.log('🔄 Enviando invitación a:', email, 'con rol:', role)

      try {
        // Verificar si ya existe una invitación pendiente
        const { data: existingInvitation, error: invitationCheckError } = await supabase
          .from('user_invitations')
          .select('id, status')
          .eq('email', email)
          .eq('org_id', user.org_id)
          .eq('status', 'pending')
          .maybeSingle()

        if (invitationCheckError) {
          console.error('❌ Error verificando invitación existente:', invitationCheckError)
        }

        if (existingInvitation) {
          throw new Error(`Ya existe una invitación pendiente para ${email}. Puedes cancelarla primero si deseas enviar una nueva.`)
        }

        // Verificar si el usuario ya existe
        const { data: existingUser, error: userCheckError } = await supabase
          .from('users')
          .select('id')
          .eq('email', email)
          .eq('org_id', user.org_id)
          .maybeSingle()

        if (userCheckError) {
          console.error('❌ Error verificando usuario existente:', userCheckError)
        }

        if (existingUser) {
          throw new Error('Este usuario ya existe en tu organización')
        }

        // Generar token y crear invitación
        const expiresAt = new Date()
        expiresAt.setDate(expiresAt.getDate() + 7)

        const { data: tokenResult } = await supabase
          .rpc('generate_invitation_token')

        if (!tokenResult) throw new Error('Error generando token de invitación')

        const { data: invitation, error } = await supabase
          .from('user_invitations')
          .insert({
            org_id: user.org_id,
            email,
            role,
            token: tokenResult,
            expires_at: expiresAt.toISOString(),
            invited_by: user.id,
            status: 'pending'
          })
          .select()
          .single()

        if (error) throw error

        console.log('✅ Invitación creada exitosamente:', invitation)

        // Enviar email de invitación con diagnóstico mejorado
        try {
          const invitationUrl = `${window.location.origin}/signup?token=${tokenResult}`
          const emailHtml = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #333;">Has sido invitado a unirte a nuestra asesoría</h2>
              <p>Hola,</p>
              <p>Has sido invitado por <strong>${user.email}</strong> para unirte a nuestra asesoría con el rol de <strong>${getRoleLabel(role)}</strong>.</p>
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

          console.log('📧 Preparando envío de email...')
          console.log('📧 URL de invitación:', invitationUrl)
          console.log('📧 Destinatario:', email)

          // Probar primero con un test
          console.log('🧪 Ejecutando test de email...')
          const { data: testResponse, error: testError } = await supabase.functions.invoke('send-email', {
            body: {
              to: email,
              subject: 'Test de configuración - CRM Sistema',
              html: '<p>Test de configuración de email</p>',
              testMode: true
            }
          })

          console.log('🧪 Resultado del test:', { testResponse, testError })

          if (testError) {
            console.error('❌ Test de email falló:', testError)
            throw new Error(`Test de email falló: ${testError.message}`)
          }

          // Si el test pasa, enviar el email real
          console.log('📧 Enviando email de invitación real...')
          const { data: emailResponse, error: emailError } = await supabase.functions.invoke('send-email', {
            body: {
              to: email,
              subject: 'Invitación para unirte a nuestra asesoría',
              html: emailHtml,
              invitationToken: tokenResult
            }
          })

          console.log('📧 Respuesta de email real:', { emailResponse, emailError })

          if (emailError) {
            console.error('❌ Error enviando email:', emailError)
            // No fallar completamente, pero informar al usuario
            toast.warning(
              'Invitación creada exitosamente, pero hubo un problema enviando el email automáticamente. ' +
              'Puedes usar el enlace manual desde la tabla de invitaciones.'
            )
          } else {
            console.log('✅ Email enviado correctamente')
            toast.success('Invitación enviada exitosamente')
          }

        } catch (emailError: any) {
          console.error('❌ Error crítico en envío de email:', emailError)
          toast.warning(
            'Invitación creada exitosamente, pero no se pudo enviar el email automáticamente. ' +
            'El enlace de invitación está disponible en la tabla de invitaciones.'
          )
        }

        return invitation
      } catch (error: any) {
        console.error('❌ Error en sendInvitation:', error)
        throw error
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-invitations'] })
    },
    onError: (error: any) => {
      console.error('Error procesando invitación:', error)
      toast.error(error.message || 'Error procesando la invitación')
    },
  })

  const cancelInvitation = useMutation({
    mutationFn: async (invitationId: string) => {
      const { error } = await supabase
        .from('user_invitations')
        .update({ status: 'cancelled' })
        .eq('id', invitationId)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-invitations'] })
      toast.success('Invitación cancelada')
    },
    onError: (error: any) => {
      toast.error('Error cancelando la invitación')
    },
  })

  const resendInvitation = useMutation({
    mutationFn: async (invitationId: string) => {
      console.log('🔄 Reenviando invitación:', invitationId)
      
      // Obtener datos de la invitación
      const { data: invitation, error } = await supabase
        .from('user_invitations')
        .select('*')
        .eq('id', invitationId)
        .single()

      if (error || !invitation) throw new Error('Invitación no encontrada')

      console.log('📧 Datos de invitación:', invitation)

      // Actualizar fecha de expiración
      const expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + 7)

      await supabase
        .from('user_invitations')
        .update({ 
          expires_at: expiresAt.toISOString(),
          status: 'pending'
        })
        .eq('id', invitationId)

      // Intentar reenviar email con diagnóstico
      try {
        const invitationUrl = `${window.location.origin}/signup?token=${invitation.token}`
        const emailHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Recordatorio: Invitación pendiente</h2>
            <p>Hola,</p>
            <p>Te recordamos que tienes una invitación pendiente para unirte a nuestra asesoría con el rol de <strong>${getRoleLabel(invitation.role)}</strong>.</p>
            <div style="margin: 30px 0;">
              <a href="${invitationUrl}" 
                 style="background-color: #0061FF; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Aceptar Invitación
              </a>
            </div>
            <p>Este enlace expira el ${new Date(expiresAt).toLocaleDateString('es-ES')}.</p>
          </div>
        `

        console.log('📧 Reenviando email a:', invitation.email)

        const { data: emailResponse, error: emailError } = await supabase.functions.invoke('send-email', {
          body: {
            to: invitation.email,
            subject: 'Recordatorio: Invitación pendiente',
            html: emailHtml,
            invitationToken: invitation.token
          }
        })

        console.log('📧 Respuesta de reenvío:', { emailResponse, emailError })

        if (emailError) {
          console.error('❌ Error reenviando email:', emailError)
          throw new Error(`Error reenviando email: ${emailError.message}`)
        }

        console.log('✅ Email reenviado exitosamente')
      } catch (emailError: any) {
        console.error('❌ Error crítico reenviando:', emailError)
        throw new Error(`Error reenviando el email: ${emailError.message}`)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-invitations'] })
      toast.success('Invitación reenviada exitosamente')
    },
    onError: (error: any) => {
      console.error('Error reenviando invitación:', error)
      toast.error(`Error reenviando la invitación: ${error.message}`)
    },
  })

  const getRoleLabel = (role: string) => {
    const labels = {
      partner: 'Partner',
      area_manager: 'Area Manager',
      senior: 'Senior',
      junior: 'Junior',
      finance: 'Finanzas'
    }
    return labels[role as keyof typeof labels] || role
  }

  return {
    invitations,
    isLoading,
    sendInvitation,
    cancelInvitation,
    resendInvitation,
    getRoleLabel
  }
}
