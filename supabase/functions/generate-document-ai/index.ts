import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DocumentAIRequest {
  templateContent: string
  documentType: 'contract' | 'communication' | 'procedural'
  variables: Record<string, any>
  practiceArea?: string
  context?: string
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const { 
      templateContent, 
      documentType, 
      variables, 
      practiceArea, 
      context 
    }: DocumentAIRequest = await req.json();

    console.log('🤖 Mejorando documento con IA:', { documentType, practiceArea });

    // Crear el prompt según el tipo de documento
    let systemPrompt = '';
    let userPrompt = '';

    switch (documentType) {
      case 'contract':
        systemPrompt = `Eres un experto abogado especializado en redacción de contratos. Tu tarea es mejorar y completar contratos legales, asegurándote de que sean jurídicamente sólidos, claros y completos. Mantén siempre un lenguaje formal y preciso.`;
        userPrompt = `Mejora el siguiente contrato legal:

PLANTILLA ORIGINAL:
${templateContent}

VARIABLES PROPORCIONADAS:
${JSON.stringify(variables, null, 2)}

ÁREA DE PRÁCTICA: ${practiceArea || 'General'}
${context ? `CONTEXTO ADICIONAL: ${context}` : ''}

INSTRUCCIONES:
1. Mantén la estructura original pero mejora la redacción jurídica
2. Añade cláusulas importantes que puedan faltar
3. Asegúrate de que el lenguaje sea preciso y profesional
4. Incluye las variables proporcionadas en el texto mejorado
5. Mantén el formato y estructura general
6. Si hay información legal relevante que añadir, inclúyela

Devuelve SOLO el contrato mejorado, sin explicaciones adicionales.`;
        break;

      case 'communication':
        systemPrompt = `Eres un experto en comunicaciones legales formales. Tu tarea es mejorar cartas, notificaciones y comunicaciones oficiales, asegurándote de que sean claras, formales y efectivas.`;
        userPrompt = `Mejora la siguiente comunicación legal:

PLANTILLA ORIGINAL:
${templateContent}

VARIABLES PROPORCIONADAS:
${JSON.stringify(variables, null, 2)}

ÁREA DE PRÁCTICA: ${practiceArea || 'General'}
${context ? `CONTEXTO ADICIONAL: ${context}` : ''}

INSTRUCCIONES:
1. Mejora el tono y formalidad de la comunicación
2. Asegúrate de que sea clara y directa
3. Incluye las variables proporcionadas
4. Mantén la estructura pero mejora el contenido
5. Añade elementos de cortesía profesional apropiados
6. Asegúrate de que sea jurídicamente apropiada

Devuelve SOLO la comunicación mejorada, sin explicaciones adicionales.`;
        break;

      case 'procedural':
        systemPrompt = `Eres un experto en derecho procesal. Tu tarea es mejorar documentos procesales como demandas, recursos, escritos, etc., asegurándote de que cumplan con los requisitos legales y sean técnicamente correctos.`;
        userPrompt = `Mejora el siguiente documento procesal:

PLANTILLA ORIGINAL:
${templateContent}

VARIABLES PROPORCIONADAS:
${JSON.stringify(variables, null, 2)}

ÁREA DE PRÁCTICA: ${practiceArea || 'General'}
${context ? `CONTEXTO ADICIONAL: ${context}` : ''}

INSTRUCCIONES:
1. Asegúrate de que cumpla con los requisitos procesales
2. Mejora la argumentación jurídica si es aplicable
3. Incluye las variables proporcionadas correctamente
4. Mantén la estructura formal requerida
5. Añade fundamentos de derecho si es necesario
6. Asegúrate de que sea técnicamente preciso

Devuelve SOLO el documento procesal mejorado, sin explicaciones adicionales.`;
        break;

      default:
        throw new Error('Tipo de documento no soportado');
    }

    // Llamar a OpenAI
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.3, // Baja temperatura para mayor precisión en documentos legales
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('❌ Error de OpenAI:', error);
      throw new Error(`Error de OpenAI: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const improvedContent = data.choices[0].message.content;

    console.log('✅ Documento mejorado con IA exitosamente');

    return new Response(JSON.stringify({ 
      improvedContent,
      model: 'gpt-4.1-2025-04-14',
      usage: data.usage
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Error en generate-document-ai:', error);
    return new Response(JSON.stringify({ 
      error: (error instanceof Error ? error.message : String(error)) || 'Error interno del servidor',
      details: error
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});