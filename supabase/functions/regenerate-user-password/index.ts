import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      headers: { 
        ...corsHeaders, 
        'Access-Control-Allow-Methods': 'POST, OPTIONS' 
      },
      status: 200 
    });
  }

  try {
    // Crear cliente para validar permisos del solicitante
    const supabaseCaller = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: {
            Authorization: req.headers.get('Authorization') ?? '',
          },
        },
      }
    )

    // Validar que el solicitante está autenticado
    const { data: { user: caller }, error: callerError } = await supabaseCaller.auth.getUser()
    if (callerError || !caller) {
      console.error('❌ Caller authentication failed:', callerError)
      throw new Error('No autorizado')
    }

    // Obtener información del solicitante desde la tabla users
    const { data: callerUser, error: callerUserError } = await supabaseCaller
      .from('users')
      .select('org_id, role')
      .eq('id', caller.id)
      .single()

    if (callerUserError || !callerUser) {
      console.error('❌ Caller user not found:', callerUserError)
      throw new Error('Usuario solicitante no encontrado')
    }

    // Validar que el solicitante tiene permisos (partner)
    if (callerUser.role !== 'partner') {
      console.error('❌ Insufficient permissions for user:', caller.id, 'role:', callerUser.role)
      throw new Error('Permisos insuficientes. Solo los partners pueden regenerar contraseñas.')
    }

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

    // Validar que el usuario objetivo pertenece a la misma organización
    if (orgId !== callerUser.org_id) {
      console.error('❌ Organization mismatch:', orgId, 'vs caller org:', callerUser.org_id)
      throw new Error('No puedes regenerar contraseñas de usuarios de otra organización')
    }

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

    // Almacenar hash de credenciales temporalmente (24 horas)
    const encoder = new TextEncoder()
    const passwordBytes = encoder.encode(newPassword)
    const hashBuffer = await crypto.subtle.digest('SHA-256', passwordBytes)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    const hashedPassword = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')

    const { error: credentialsError } = await supabaseAdmin
      .from('user_credentials_temp')
      .insert({
        user_id: userId,
        email: existingUser.email,
        encrypted_password: hashedPassword,
        created_by: caller.id,
        org_id: orgId,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 horas
        viewed_count: 0
      })

    if (credentialsError) {
      console.error('❌ Error storing temporary credentials:', credentialsError)
    }

    console.log('✅ Password regenerated successfully for user:', userId)

    return new Response(
      JSON.stringify({
        email: existingUser.email,
        temporaryPassword: newPassword,
        userId: userId,
        warning: 'Comunica esta contraseña al usuario de forma segura. No se podrá recuperar después.'
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