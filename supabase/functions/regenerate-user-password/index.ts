import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    const { userId, orgId } = await req.json()

    console.log('🔄 Regenerating password for user:', userId, 'in org:', orgId)

    // Verificar que el usuario existe y pertenece a la organización
    const { data: existingUser, error: userError } = await supabaseAdmin
      .from('users')
      .select('id, email, org_id')
      .eq('id', userId)
      .eq('org_id', orgId)
      .single()

    if (userError) {
      console.error('❌ Error fetching user:', userError)
      throw new Error(`Usuario no encontrado: ${userError.message}`)
    }

    if (!existingUser) {
      throw new Error('Usuario no encontrado en la organización')
    }

    // Generar nueva contraseña temporal
    const generateSecurePassword = () => {
      const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%&*'
      let password = ''
      for (let i = 0; i < 12; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length))
      }
      return password
    }

    const newPassword = generateSecurePassword()

    // Actualizar contraseña en Supabase Auth usando Admin API
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.updateUserById(
      userId,
      { password: newPassword }
    )

    if (authError) {
      console.error('❌ Error updating password in Auth:', authError)
      throw new Error(`Error actualizando contraseña: ${authError.message}`)
    }

    if (!authUser.user) {
      throw new Error('Error: No se pudo actualizar la contraseña del usuario')
    }

    // Almacenar credenciales temporalmente (24 horas)
    const encryptedPassword = btoa(newPassword) // Simple encoding para la demo
    const { error: credentialsError } = await supabaseAdmin
      .from('user_credentials_temp')
      .insert({
        user_id: userId,
        email: existingUser.email,
        encrypted_password: encryptedPassword,
        created_by: (await supabaseAdmin.auth.getUser()).data.user?.id,
        org_id: orgId,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 horas
        viewed_count: 0
      })

    if (credentialsError) {
      console.error('❌ Error storing temporary credentials:', credentialsError)
      // No fallar la regeneración por esto, solo loguear
    }

    console.log('✅ Password regenerated successfully for user:', userId)

    return new Response(
      JSON.stringify({
        email: existingUser.email,
        password: newPassword,
        userId: userId
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Error in regenerate-user-password function:', error)
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : String(error) }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})