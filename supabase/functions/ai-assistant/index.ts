
import "https://deno.land/x/xhr@0.1.0/mod.ts"
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const openAIApiKey = Deno.env.get('OPENAI_API_KEY')

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  const startTime = Date.now()
  let logData = {
    org_id: null as string | null,
    user_id: null as string | null,
    function_name: 'ai-assistant',
    prompt_tokens: null as number | null,
    completion_tokens: null as number | null,
    total_tokens: null as number | null,
    estimated_cost: null as number | null,
    duration_ms: null as number | null,
    model_used: 'gpt-4o-mini',
    success: true,
    error_message: null as string | null
  }

  try {
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured')
    }

    const { message, context, conversation_history } = await req.json()
    
    // Capturar org_id and user_id para logging
    logData.org_id = context?.org_id
    logData.user_id = context?.user_id
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Obtener contexto adicional de la base de datos si es necesario
    let contextData = ''
    
    if (context?.org_id) {
      // Obtener estadísticas básicas de clientes
      const { data: clientStats } = await supabase
        .from('clients')
        .select('status, client_type')
        .eq('org_id', context.org_id)

      if (clientStats) {
        const stats = {
          total: clientStats.length,
          active: clientStats.filter(c => c.status === 'activo').length,
          prospects: clientStats.filter(c => c.status === 'prospecto').length,
          companies: clientStats.filter(c => c.client_type === 'empresa').length
        }
        contextData = `Estadísticas actuales del despacho: ${stats.total} clientes total, ${stats.active} activos, ${stats.prospects} prospectos, ${stats.companies} empresas.`
      }
    }

    // Construir el historial de conversación para OpenAI
    const messages = [
      {
        role: 'system',
        content: `Eres un asistente de IA especializado en despachos jurídicos y asesorías multidisciplinares. Tu función es ayudar a los usuarios con tareas relacionadas con la gestión de clientes, expedientes, citas y administración legal.

Características importantes:
- Eres útil, profesional y tienes conocimiento del sector jurídico español
- Puedes ayudar con la creación de clientes, búsqueda de información, programación de citas, etc.
- Siempre respondes en español
- Eres conciso pero completo en tus respuestas
- Puedes sugerir acciones específicas que el usuario puede realizar

${contextData ? `Contexto actual: ${contextData}` : ''}

Página actual: ${context?.current_page || 'No especificada'}

IMPORTANTE: 
- Si el usuario pide crear un cliente, pregunta por los datos necesarios paso a paso
- Si pregunta por estadísticas, usa la información del contexto
- Si pide buscar algo específico, guía al usuario sobre cómo hacerlo
- Siempre mantén un tono profesional pero amigable`
      }
    ]

    // Agregar historial de conversación
    if (conversation_history && conversation_history.length > 0) {
      conversation_history.forEach((msg: any) => {
        messages.push({
          role: msg.role,
          content: msg.content
        })
      })
    }

    // Agregar mensaje actual del usuario
    messages.push({
      role: 'user',
      content: message
    })

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: messages,
        max_tokens: 500,
        temperature: 0.7,
      }),
    })

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`)
    }

    const data = await response.json()
    const aiResponse = data.choices[0].message.content

    // Capturar información de tokens para logging
    if (data.usage) {
      logData.prompt_tokens = data.usage.prompt_tokens
      logData.completion_tokens = data.usage.completion_tokens
      logData.total_tokens = data.usage.total_tokens
      
      // Calcular costo estimado (precios aproximados de gpt-4o-mini)
      const inputCostPer1k = 0.00015 // $0.00015 per 1K input tokens
      const outputCostPer1k = 0.0006 // $0.0006 per 1K output tokens
      
      const inputCost = (logData.prompt_tokens / 1000) * inputCostPer1k
      const outputCost = (logData.completion_tokens / 1000) * outputCostPer1k
      logData.estimated_cost = inputCost + outputCost
    }

    // Generar sugerencias basadas en la respuesta
    const suggestions = generateSuggestions(message, aiResponse, context)

    // Detectar si hay alguna acción específica que se puede ejecutar
    const action = detectAction(message, aiResponse)

    // Calcular duración
    logData.duration_ms = Date.now() - startTime

    // Registrar el uso en la base de datos
    if (logData.org_id && logData.user_id) {
      await supabase
        .from('ai_usage_logs')
        .insert([logData])
        .select()
    }

    return new Response(JSON.stringify({
      response: aiResponse,
      suggestions: suggestions,
      action: action
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('Error in ai-assistant function:', error)
    
    // Registrar el error
    logData.success = false
    logData.error_message = error.message
    logData.duration_ms = Date.now() - startTime
    
    if (logData.org_id && logData.user_id) {
      const supabase = createClient(supabaseUrl, supabaseServiceKey)
      await supabase
        .from('ai_usage_logs')
        .insert([logData])
        .select()
        .catch(console.error) // No fallar si no se puede registrar el log
    }
    
    return new Response(JSON.stringify({ 
      error: error.message,
      response: 'Lo siento, ha ocurrido un error al procesar tu solicitud. Por favor, inténtalo de nuevo.'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})

function generateSuggestions(userMessage: string, aiResponse: string, context: any): string[] {
  const suggestions: string[] = []
  
  const lowerMessage = userMessage.toLowerCase()
  const lowerResponse = aiResponse.toLowerCase()

  // Sugerencias basadas en el mensaje del usuario
  if (lowerMessage.includes('cliente') || lowerMessage.includes('crear')) {
    suggestions.push('Crear nuevo cliente')
    suggestions.push('Ver lista de clientes')
    suggestions.push('Buscar cliente específico')
  }

  if (lowerMessage.includes('expediente') || lowerMessage.includes('caso')) {
    suggestions.push('Ver expedientes activos')
    suggestions.push('Crear nuevo expediente')
    suggestions.push('Buscar por número de expediente')
  }

  if (lowerMessage.includes('cita') || lowerMessage.includes('agenda')) {
    suggestions.push('Ver calendario')
    suggestions.push('Programar nueva cita')
    suggestions.push('Ver citas de hoy')
  }

  if (lowerMessage.includes('estadistica') || lowerMessage.includes('reporte')) {
    suggestions.push('Ver métricas de clientes')
    suggestions.push('Exportar datos')
    suggestions.push('Generar reporte')
  }

  // Sugerencias por defecto si no hay específicas
  if (suggestions.length === 0) {
    suggestions.push('¿Cómo puedo crear un cliente?')
    suggestions.push('Mostrar estadísticas')
    suggestions.push('¿Qué puedes hacer por mí?')
  }

  return suggestions.slice(0, 4) // Máximo 4 sugerencias
}

function detectAction(userMessage: string, aiResponse: string): any {
  const lowerMessage = userMessage.toLowerCase()
  
  // Detectar acciones específicas que se pueden ejecutar automáticamente
  if (lowerMessage.includes('crear cliente') && lowerMessage.includes('con datos')) {
    return {
      type: 'create_client',
      data: extractClientDataFromMessage(userMessage)
    }
  }

  if (lowerMessage.includes('ir a') || lowerMessage.includes('navegar')) {
    const page = extractPageFromMessage(userMessage)
    if (page) {
      return {
        type: 'navigate',
        page: page
      }
    }
  }

  return null
}

function extractClientDataFromMessage(message: string): any {
  // Esta función podría extraer datos estructurados del mensaje del usuario
  // Por ahora retornamos null, pero se podría implementar lógica más avanzada
  return null
}

function extractPageFromMessage(message: string): string | null {
  const lowerMessage = message.toLowerCase()
  
  if (lowerMessage.includes('cliente')) return '/clients'
  if (lowerMessage.includes('expediente') || lowerMessage.includes('caso')) return '/cases'
  if (lowerMessage.includes('calendario') || lowerMessage.includes('agenda')) return '/calendar'
  if (lowerMessage.includes('dashboard') || lowerMessage.includes('inicio')) return '/dashboard'
  
  return null
}
