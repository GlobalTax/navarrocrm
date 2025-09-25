import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { documentId, analysisType, orgId } = await req.json();
    
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Obtener el documento
    const { data: document, error: docError } = await supabase
      .from('generated_documents')
      .select('content, title, template_id')
      .eq('id', documentId)
      .eq('org_id', orgId)
      .single()

    if (docError) throw new Error('Document not found');

    // Preparar prompt según el tipo de análisis
    let systemPrompt = '';
    let userPrompt = '';

    switch (analysisType) {
      case 'content_quality':
        systemPrompt = 'Eres un experto en redacción y calidad de contenido legal y empresarial. Analiza el documento y proporciona sugerencias para mejorar claridad, coherencia y profesionalismo.';
        userPrompt = `Analiza la calidad del siguiente documento:\n\nTítulo: ${document.title}\n\nContenido:\n${document.content}\n\nProporciona un análisis detallado de la calidad del contenido.`;
        break;
      case 'legal_review':
        systemPrompt = 'Eres un abogado experto en revisión de documentos legales. Identifica posibles problemas legales, inconsistencias y áreas que requieren atención.';
        userPrompt = `Revisa legalmente el siguiente documento:\n\nTítulo: ${document.title}\n\nContenido:\n${document.content}\n\nIdentifica problemas legales y sugiere mejoras.`;
        break;
      case 'consistency_check':
        systemPrompt = 'Eres un experto en consistencia documental. Identifica inconsistencias internas, términos contradictorios y problemas de coherencia.';
        userPrompt = `Verifica la consistencia del siguiente documento:\n\nTítulo: ${document.title}\n\nContenido:\n${document.content}\n\nIdentifica inconsistencias y contradicciones.`;
        break;
      case 'sentiment_analysis':
        systemPrompt = 'Eres un experto en análisis de sentimientos y tono de comunicación. Analiza el tono del documento y sugiere ajustes para mejorar la percepción.';
        userPrompt = `Analiza el tono y sentimiento del siguiente documento:\n\nTítulo: ${document.title}\n\nContenido:\n${document.content}\n\nProporciona análisis de tono y sugerencias.`;
        break;
      default:
        throw new Error('Invalid analysis type');
    }

    // Llamar a OpenAI
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
            name: 'provide_analysis',
            description: 'Proporciona el análisis del documento con hallazgos y sugerencias',
            parameters: {
              type: 'object',
              properties: {
                findings: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      type: { type: 'string', enum: ['error', 'warning', 'info', 'suggestion'] },
                      category: { type: 'string' },
                      message: { type: 'string' },
                      confidence: { type: 'number', minimum: 0, maximum: 1 },
                      auto_fixable: { type: 'boolean' }
                    }
                  }
                },
                suggestions: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      type: { type: 'string', enum: ['content_improvement', 'legal_compliance', 'structure', 'clarity'] },
                      original_text: { type: 'string' },
                      suggested_text: { type: 'string' },
                      reason: { type: 'string' },
                      confidence: { type: 'number', minimum: 0, maximum: 1 }
                    }
                  }
                },
                confidence_score: { type: 'number', minimum: 0, maximum: 1 }
              }
            }
          }
        ],
        function_call: { name: 'provide_analysis' }
      }),
    });

    const aiResponse = await response.json();
    const analysisData = JSON.parse(aiResponse.choices[0].message.function_call.arguments);

    // Guardar análisis en la base de datos
    const { data: savedAnalysis, error: saveError } = await supabase
      .from('document_analysis')
      .insert({
        document_id: documentId,
        analysis_type: analysisType,
        findings: analysisData.findings || [],
        suggestions: analysisData.suggestions || [],
        confidence_score: analysisData.confidence_score || 0,
        analysis_data: {
          ai_model: 'gpt-4o-mini',
          processing_time: Date.now(),
          prompt_tokens: aiResponse.usage?.prompt_tokens || 0,
          completion_tokens: aiResponse.usage?.completion_tokens || 0
        },
        org_id: orgId
      })
      .select()
      .single()

    if (saveError) throw saveError;

    // Actualizar métricas
    await supabase
      .from('document_ai_metrics')
      .upsert({
        org_id: orgId,
        metric_date: new Date().toISOString().split('T')[0],
        documents_analyzed: 1
      }, {
        onConflict: 'org_id,metric_date',
        ignoreDuplicates: false
      })

    return new Response(JSON.stringify(savedAnalysis), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in analyze-document-ai function:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : String(error),
      details: 'Failed to analyze document'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});