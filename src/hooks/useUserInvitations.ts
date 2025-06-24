
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

      // Verificar si ya existe una invitación pendiente
      const { data: existingInvitation } = await supabase
        .from('user_invitations')
        .select('id')
        .eq('email', email)
        .eq('org_id', user.org_id)
        .eq('status', 'pending')
        .single()

      if (existingInvitation) {
        throw new Error('Ya existe una invitación pendiente para este email')
      }

      // Verificar si el usuario ya existe
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .eq('org_id', user.org_id)
        .single()

      if (existingUser) {
        throw new Error('Este usuario ya existe en tu organización')
      }

      // Generar token y crear invitación
      const expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + 7) // 7 días de expiración

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

      // Enviar email de invitación
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

      const { error: emailError } = await supabase.functions.invoke('send-email', {
        body: {
          to: email,
          subject: 'Invitación para unirte a nuestra asesoría',
          html: emailHtml,
          invitationToken: tokenResult
        }
      })

      if (emailError) {
        console.error('Error enviando email:', emailError)
        // No fallar la invitación si el email falla
        toast.warning('Invitación creada, pero hubo un problema enviando el email')
      }

      return invitation
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-invitations'] })
      toast.success('Invitación enviada correctamente')
    },
    onError: (error: any) => {
      console.error('Error enviando invitación:', error)
      toast.error(error.message || 'Error enviando la invitación')
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
      // Obtener datos de la invitación
      const { data: invitation, error } = await supabase
        .from('user_invitations')
        .select('*')
        .eq('id', invitationId)
        .single()

      if (error || !invitation) throw new Error('Invitación no encontrada')

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

      // Reenviar email
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

      await supabase.functions.invoke('send-email', {
        body: {
          to: invitation.email,
          subject: 'Recordatorio: Invitación pendiente',
          html: emailHtml,
          invitationToken: invitation.token
        }
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-invitations'] })
      toast.success('Invitación reenviada')
    },
    onError: (error: any) => {
      toast.error('Error reenviando la invitación')
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
