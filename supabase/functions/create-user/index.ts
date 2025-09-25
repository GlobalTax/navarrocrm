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

    const { email, role, firstName = '', lastName = '', orgId } = await req.json()

    console.log('🔄 Creating user:', email, 'with role:', role)

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

    // Generar contraseña temporal
    const generateSecurePassword = () => {
      const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%&*'
      let password = ''
      for (let i = 0; i < 12; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length))
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
        org_id: orgId,
        first_name: firstName || null,
        last_name: lastName || null,
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

    console.log('✅ User created successfully:', authUser.user.id)

    return new Response(
      JSON.stringify({
        email,
        password: temporaryPassword,
        userId: authUser.user.id
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Error in create-user function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})