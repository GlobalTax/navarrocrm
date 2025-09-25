import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { content, documentType, enhancementType, context, orgId } = await req.json();
    
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Preparar prompt según el tipo de mejora
    let systemPrompt = '';
    let userPrompt = '';

    switch (enhancementType) {
      case 'grammar':
        systemPrompt = 'Eres un experto en gramática y ortografía del español. Corrige errores gramaticales y de ortografía manteniendo el significado original.';
        userPrompt = `Corrige la gramática y ortografía del siguiente texto:\n\n${content}`;
        break;
      case 'clarity':
        systemPrompt = 'Eres un experto en comunicación clara y efectiva. Mejora la claridad y legibilidad del texto sin cambiar su significado fundamental.';
        userPrompt = `Mejora la claridad del siguiente texto:\n\n${content}`;
        break;
      case 'legal_language':
        systemPrompt = 'Eres un abogado experto en redacción legal. Mejora el lenguaje jurídico manteniendo la precisión legal y formal.';
        userPrompt = `Mejora el lenguaje legal del siguiente texto:\n\n${content}`;
        break;
      case 'professional_tone':
        systemPrompt = 'Eres un experto en comunicación empresarial. Ajusta el tono para que sea más profesional y apropiado para el contexto empresarial.';
        userPrompt = `Mejora el tono profesional del siguiente texto:\n\n${content}`;
        break;
      default:
        throw new Error('Invalid enhancement type');
    }

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
        functions: [
          {
            name: 'enhance_content',
            description: 'Proporciona el contenido mejorado con detalles de las mejoras realizadas',
            parameters: {
              type: 'object',
              properties: {
                enhanced_content: {
                  type: 'string',
                  description: 'El contenido mejorado'
                },
                improvements: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      type: { type: 'string' },
                      description: { type: 'string' },
                      original: { type: 'string' },
                      enhanced: { type: 'string' }
                    }
                  }
                }
              }
            }
          }
        ],
        function_call: { name: 'enhance_content' }
      }),
    });

    const aiResponse = await response.json();
    const enhancementData = JSON.parse(aiResponse.choices[0].message.function_call.arguments);

    const result = {
      enhanced_content: enhancementData.enhanced_content,
      improvements: enhancementData.improvements || [],
      metadata: {
        enhancement_type: enhancementType,
        processing_time: Date.now(),
        ai_model: 'gpt-4o-mini'
      }
    };

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in enhance-document-content function:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : String(error),
      details: 'Failed to enhance document content'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});