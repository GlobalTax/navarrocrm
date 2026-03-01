import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        ...corsHeaders,
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      }
    })
  }

  try {
    // Verificar autenticación del caller
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No autorizado' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabaseAuth = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    )
    const { data: { user: caller }, error: authError } = await supabaseAuth.auth.getUser()
    if (authError || !caller) {
      return new Response(
        JSON.stringify({ error: 'No autorizado' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
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

    // Verificar que el caller tiene rol admin en su org
    const { data: callerProfile } = await supabaseAdmin
      .from('users')
      .select('role, org_id')
      .eq('id', caller.id)
      .single()

    if (!callerProfile || !['admin', 'superadmin'].includes(callerProfile.role)) {
      return new Response(
        JSON.stringify({ error: 'Solo administradores pueden crear usuarios' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { email, role, firstName = '', lastName = '', orgId } = await req.json()

    // Verificar que el admin pertenece a la misma org
    if (callerProfile.org_id !== orgId) {
      return new Response(
        JSON.stringify({ error: 'No puedes crear usuarios en otra organización' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Verificar si el usuario ya existe
    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', email)
      .eq('org_id', orgId)
      .maybeSingle()

    if (existingUser) {
      throw new Error('Este usuario ya existe en tu organización')
    }

    // Generar contraseña temporal con crypto seguro
    const generateSecurePassword = () => {
      const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%&*'
      const randomValues = new Uint32Array(16)
      crypto.getRandomValues(randomValues)
      let password = ''
      for (let i = 0; i < 16; i++) {
        password += chars.charAt(randomValues[i] % chars.length)
      }
      return password
    }

    const temporaryPassword = generateSecurePassword()

    // Crear usuario en Supabase Auth usando Admin API
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: temporaryPassword,
      email_confirm: true, // Auto-confirmar email para aplicación interna
      user_metadata: {
        first_name: firstName,
        last_name: lastName,
        org_id: orgId,
        role
      }
    })

    if (authError) {
      console.error('❌ Error creating user in Auth:', authError)
      throw new Error(`Error creando usuario: ${authError.message}`)
    }

    if (!authUser.user) {
      throw new Error('Error: No se pudo crear el usuario')
    }

    // Crear registro en la tabla users
    const { error: profileError } = await supabaseAdmin
      .from('users')
      .insert({
        id: authUser.user.id,
        email,
        role,
        first_name: firstName,
        last_name: lastName,
        org_id: orgId,
        is_active: true
      })

    if (profileError) {
      console.error('❌ Error creating user profile:', profileError)
      
      // Si falla la creación del perfil, eliminamos el usuario de Auth
      try {
        await supabaseAdmin.auth.admin.deleteUser(authUser.user.id)
      } catch (cleanupError) {
        console.error('❌ Error cleaning up Auth user:', cleanupError)
      }
      
      throw new Error(`Error creando perfil: ${profileError.message}`)
    }

    console.log('✅ User created successfully')

    // Almacenar credenciales temporalmente (24 horas) con encriptación real
    const encoder = new TextEncoder()
    const passwordBytes = encoder.encode(temporaryPassword)
    const hashBuffer = await crypto.subtle.digest('SHA-256', passwordBytes)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    const hashedPassword = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')

    const { error: credentialsError } = await supabaseAdmin
      .from('user_credentials_temp')
      .insert({
        user_id: authUser.user.id,
        email,
        encrypted_password: hashedPassword,
        created_by: caller.id,
        org_id: orgId,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 horas
        viewed_count: 0
      })

    if (credentialsError) {
      console.error('❌ Error storing temporary credentials:', credentialsError)
    }

    // Devolver contraseña temporal solo en la respuesta inmediata de creación
    // El admin la comunica al usuario de forma segura (presencial, llamada, etc.)
    return new Response(
      JSON.stringify({
        email,
        temporaryPassword,
        userId: authUser.user.id,
        warning: 'Comunica esta contraseña al usuario de forma segura. No se podrá recuperar después.'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Error in create-user function:', error)
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : String(error) }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})