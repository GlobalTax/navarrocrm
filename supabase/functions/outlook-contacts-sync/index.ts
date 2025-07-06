import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ContactSyncRequest {
  user_id: string
  org_id: string
  force_sync?: boolean
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { user_id, org_id, force_sync = false }: ContactSyncRequest = await req.json()
    
    console.log('Iniciando sincronización de contactos para usuario:', user_id)

    // Obtener token de Outlook del usuario
    const { data: tokenData, error: tokenError } = await supabase
      .from('user_outlook_tokens')
      .select('access_token_encrypted, refresh_token_encrypted, token_expires_at')
      .eq('user_id', user_id)
      .eq('org_id', org_id)
      .eq('is_active', true)
      .single()

    if (tokenError || !tokenData) {
      console.error('Token no encontrado:', tokenError)
      throw new Error('Usuario no tiene token de Outlook activo')
    }

    // Verificar si el token no ha expirado
    if (new Date(tokenData.token_expires_at) <= new Date()) {
      throw new Error('Token de Outlook expirado')
    }

    // Desencriptar token (simple base64)
    const accessToken = atob(tokenData.access_token_encrypted)
    
    console.log('Token obtenido, sincronizando contactos...')

    // Obtener contactos de Microsoft Graph
    const graphResponse = await fetch('https://graph.microsoft.com/v1.0/me/contacts?$top=999', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    })

    if (!graphResponse.ok) {
      const errorData = await graphResponse.text()
      console.error('Error llamando a Graph API:', errorData)
      throw new Error(`Error obteniendo contactos: ${graphResponse.statusText}`)
    }

    const contactsData = await graphResponse.json()
    console.log(`Obtenidos ${contactsData.value?.length || 0} contactos de Outlook`)

    let syncedCount = 0
    let skippedCount = 0

    // Procesar cada contacto
    for (const outlookContact of contactsData.value || []) {
      try {
        // Extraer información del contacto
        const contactInfo = {
          name: outlookContact.displayName || `${outlookContact.givenName || ''} ${outlookContact.surname || ''}`.trim(),
          email: outlookContact.emailAddresses?.[0]?.address || null,
          phone: outlookContact.mobilePhone || outlookContact.homePhones?.[0] || outlookContact.businessPhones?.[0] || null,
          company_name: outlookContact.companyName || null,
          job_title: outlookContact.jobTitle || null,
          address_street: outlookContact.homeAddress?.street || outlookContact.businessAddress?.street || null,
          address_city: outlookContact.homeAddress?.city || outlookContact.businessAddress?.city || null,
          address_postal_code: outlookContact.homeAddress?.postalCode || outlookContact.businessAddress?.postalCode || null,
          address_country: outlookContact.homeAddress?.countryOrRegion || outlookContact.businessAddress?.countryOrRegion || 'España',
          outlook_id: outlookContact.id,
          client_type: outlookContact.companyName ? 'empresa' : 'particular',
          relationship_type: 'contacto_outlook'
        }

        // Solo procesar si tiene nombre y al menos email o teléfono
        if (!contactInfo.name || (!contactInfo.email && !contactInfo.phone)) {
          skippedCount++
          continue
        }

        // Verificar si el contacto ya existe (por email o outlook_id)
        let existingContact = null
        if (contactInfo.email) {
          const { data } = await supabase
            .from('contacts')
            .select('id')
            .eq('org_id', org_id)
            .eq('email', contactInfo.email)
            .maybeSingle()
          
          existingContact = data
        }

        if (!existingContact && contactInfo.outlook_id) {
          const { data } = await supabase
            .from('contacts')
            .select('id')
            .eq('org_id', org_id)
            .eq('outlook_id', contactInfo.outlook_id)
            .maybeSingle()
          
          existingContact = data
        }

        if (existingContact && !force_sync) {
          skippedCount++
          continue
        }

        // Insertar o actualizar contacto
        const contactData = {
          ...contactInfo,
          org_id,
          status: 'activo',
          tags: ['outlook_sync'],
          internal_notes: `Sincronizado desde Outlook el ${new Date().toISOString()}`
        }

        if (existingContact) {
          await supabase
            .from('contacts')
            .update(contactData)
            .eq('id', existingContact.id)
        } else {
          await supabase
            .from('contacts')
            .insert(contactData)
        }

        syncedCount++

      } catch (error) {
        console.error('Error procesando contacto:', outlookContact.displayName, error)
        skippedCount++
      }
    }

    console.log(`Sincronización completada: ${syncedCount} contactos sincronizados, ${skippedCount} omitidos`)

    return new Response(
      JSON.stringify({
        success: true,
        synced_contacts: syncedCount,
        skipped_contacts: skippedCount,
        total_processed: syncedCount + skippedCount
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error en sincronización de contactos:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})