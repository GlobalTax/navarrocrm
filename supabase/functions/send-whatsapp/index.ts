
import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface WhatsAppRequest {
  phoneNumber: string
  content: string
  templateName?: string
  messageId?: string
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('🚀 WhatsApp function called')
    
    const { phoneNumber, content, templateName, messageId }: WhatsAppRequest = await req.json()
    
    // Validaciones básicas
    if (!phoneNumber || !content) {
      console.error('❌ Missing required fields')
      return new Response(
        JSON.stringify({ error: 'Phone number and content are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('📱 Sending WhatsApp message to:', phoneNumber)
    console.log('💬 Content:', content)
    
    // Inicializar Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Obtener configuración de WhatsApp
    const { data: config, error: configError } = await supabase
      .from('whatsapp_config')
      .select('*')
      .eq('is_active', true)
      .single()

    if (configError || !config) {
      console.error('❌ WhatsApp not configured:', configError)
      return new Response(
        JSON.stringify({ error: 'WhatsApp not configured' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Formatear número de teléfono (remover caracteres especiales)
    const cleanPhone = phoneNumber.replace(/[^\d]/g, '')
    console.log('📞 Clean phone:', cleanPhone)

    // Por ahora simulamos el envío exitoso
    // En producción aquí iría la llamada a WhatsApp Business API
    const mockWhatsAppMessageId = `wa_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    // Simular respuesta exitosa de WhatsApp API
    const whatsappResponse = {
      messaging_product: "whatsapp",
      contacts: [{ wa_id: cleanPhone }],
      messages: [{ id: mockWhatsAppMessageId }]
    }

    console.log('✅ WhatsApp API response (simulated):', whatsappResponse)

    // Actualizar estado del mensaje en la base de datos
    if (messageId) {
      const { error: updateError } = await supabase
        .from('whatsapp_messages')
        .update({
          status: 'sent',
          whatsapp_message_id: mockWhatsAppMessageId,
          sent_at: new Date().toISOString()
        })
        .eq('id', messageId)

      if (updateError) {
        console.error('❌ Error updating message status:', updateError)
      } else {
        console.log('✅ Message status updated')
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        messageId: mockWhatsAppMessageId,
        status: 'sent'
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error: any) {
    console.error('❌ Error in send-whatsapp function:', error)
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
