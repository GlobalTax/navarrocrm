
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CourseGenerationRequest {
  topic: string
  level: 'beginner' | 'intermediate' | 'advanced'
  estimated_lessons: number
  target_audience: string
  orgId: string
  crmContext: {
    hasClients: boolean
    hasCases: boolean
    hasTimeTracking: boolean
    hasProposals: boolean
    hasCalendar: boolean
    hasDocuments: boolean
    hasUsers: boolean
    hasReports: boolean
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const requestData: CourseGenerationRequest = await req.json()

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured')
    }

    // Construir el contexto del CRM
    const crmFeatures = Object.entries(requestData.crmContext)
      .filter(([_, hasFeature]) => hasFeature)
      .map(([feature, _]) => feature.replace('has', '').toLowerCase())
      .join(', ')

    const systemPrompt = `Eres un experto en formación para asesorías y despachos profesionales. 
Tu CRM tiene las siguientes funcionalidades: ${crmFeatures}.

Debes generar un curso práctico y profesional sobre "${requestData.topic}" para el nivel ${requestData.level}.
El curso debe tener aproximadamente ${requestData.estimated_lessons} lecciones.
Audiencia objetivo: ${requestData.target_audience}

IMPORTANTE: 
- Enfócate en casos prácticos usando las funcionalidades del CRM
- Incluye ejemplos reales de asesorías
- Cada lección debe ser actionable y práctica
- Adapta el contenido al nivel especificado (${requestData.level})

Responde ÚNICAMENTE con un JSON válido con esta estructura exacta:
{
  "title": "Título del curso",
  "description": "Descripción detallada del curso",
  "lessons": [
    {
      "title": "Título de la lección",
      "content": "Contenido completo de la lección en formato markdown",
      "lesson_type": "text",
      "estimated_duration": 15,
      "learning_objectives": ["objetivo 1", "objetivo 2"],
      "prerequisites": ["prerequisito 1"]
    }
  ]
}`

    const userPrompt = `Genera un curso sobre: "${requestData.topic}"
Nivel: ${requestData.level}
Número de lecciones: ${requestData.estimated_lessons}
Audiencia: ${requestData.target_audience}

El curso debe aprovechar las funcionalidades del CRM: ${crmFeatures}`

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 4000,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('OpenAI API error:', errorText)
      throw new Error(`OpenAI API error: ${response.status}`)
    }

    const data = await response.json()
    const generatedContent = data.choices[0].message.content

    // Intentar parsear el JSON generado
    let courseData
    try {
      courseData = JSON.parse(generatedContent)
    } catch (parseError) {
      console.error('Error parsing generated JSON:', parseError)
      console.error('Generated content:', generatedContent)
      throw new Error('Error al procesar la respuesta de IA')
    }

    // Validar la estructura del curso generado
    if (!courseData.title || !courseData.description || !Array.isArray(courseData.lessons)) {
      throw new Error('Estructura de curso inválida generada por IA')
    }

    return new Response(JSON.stringify(courseData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('Error in generate-academy-course:', error)
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : String(error) }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
