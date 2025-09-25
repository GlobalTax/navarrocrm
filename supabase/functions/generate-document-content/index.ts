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
    const { prompt, documentType, templateId, variables, tone, orgId } = await req.json();
    
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Construir el prompt del sistema basado en el tipo de documento y tono
    let systemPrompt = `Eres un experto en redacción ${documentType === 'legal' ? 'jurídica' : 'empresarial'}.`;
    
    switch (tone) {
      case 'legal':
        systemPrompt += ' Utiliza lenguaje jurídico preciso y formal. Incluye las cláusulas y terminología legal apropiadas.';
        break;
      case 'formal':
        systemPrompt += ' Utiliza un lenguaje formal y protocolario apropiado para documentos oficiales.';
        break;
      case 'professional':
        systemPrompt += ' Utiliza un lenguaje profesional, claro y directo apropiado para el entorno empresarial.';
        break;
      case 'friendly':
        systemPrompt += ' Utiliza un lenguaje profesional pero cercano, manteniendo la formalidad necesaria.';
        break;
    }

    systemPrompt += ' Genera contenido en español y asegúrate de que sea completo, coherente y bien estructurado.';

    // Incluir variables si están disponibles
    let contextInfo = '';
    if (variables && Object.keys(variables).length > 0) {
      contextInfo = '\n\nVariables disponibles para usar:\n' + 
        Object.entries(variables).map(([key, value]) => `- {{${key}}}: ${value}`).join('\n');
    }

    const userPrompt = prompt + contextInfo;

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
        max_tokens: 2000
      }),
    });

    const aiResponse = await response.json();
    const generatedContent = aiResponse.choices[0].message.content;

    const result = {
      content: generatedContent,
      metadata: {
        document_type: documentType,
        tone: tone,
        processing_time: Date.now(),
        ai_model: 'gpt-4o-mini',
        prompt_tokens: aiResponse.usage?.prompt_tokens || 0,
        completion_tokens: aiResponse.usage?.completion_tokens || 0
      }
    };

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-document-content function:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : String(error),
      details: 'Failed to generate document content'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});