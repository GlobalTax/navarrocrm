import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface OnboardingRequest {
  action: 'validate_token' | 'update_step' | 'complete_onboarding';
  token: string;
  step?: number;
  data?: Record<string, any>;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    if (req.method !== 'POST') {
      throw new Error('Método no permitido');
    }

    const body: OnboardingRequest = await req.json();
    const { action, token, step, data } = body;

    // Validar token
    const { data: onboarding, error: fetchError } = await supabase
      .from('employee_onboarding')
      .select('*')
      .eq('token', token)
      .eq('status', 'pending')
      .gte('expires_at', new Date().toISOString())
      .single();

    if (fetchError || !onboarding) {
      return new Response(
        JSON.stringify({ error: 'Token inválido o expirado' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    switch (action) {
      case 'validate_token':
        return new Response(
          JSON.stringify({
            success: true,
            onboarding: {
              id: onboarding.id,
              email: onboarding.email,
              position_title: onboarding.position_title,
              current_step: onboarding.current_step,
              personal_data: onboarding.personal_data || {},
              contact_data: onboarding.contact_data || {},
              banking_data: onboarding.banking_data || {},
              job_data: onboarding.job_data || {},
              documents: onboarding.documents || []
            }
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

      case 'update_step':
        if (!step || !data) {
          throw new Error('Step y data son requeridos');
        }

        const updateFields: Record<string, any> = {
          current_step: step,
          updated_at: new Date().toISOString()
        };

        // Mapear data al campo correcto según el step
        switch (step) {
          case 1:
            updateFields.personal_data = { ...onboarding.personal_data, ...data };
            break;
          case 2:
            updateFields.contact_data = { ...onboarding.contact_data, ...data };
            break;
          case 3:
            updateFields.banking_data = { ...onboarding.banking_data, ...data };
            break;
          case 4:
            updateFields.documents = data.documents || [];
            // Generar documentos automáticamente al completar el paso 4
            await generateOnboardingDocuments(supabase, onboarding);
            break;
          case 5:
            updateFields.job_data = { ...onboarding.job_data, ...data };
            if (data.signature) {
              updateFields.signed_at = new Date().toISOString();
            }
            break;
        }

        const { error: updateError } = await supabase
          .from('employee_onboarding')
          .update(updateFields)
          .eq('id', onboarding.id);

        if (updateError) {
          throw updateError;
        }

        return new Response(
          JSON.stringify({ success: true, message: 'Datos guardados correctamente' }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

      case 'complete_onboarding':
        // Validar que todos los pasos estén completos
        if (!onboarding.signed_at) {
          throw new Error('El onboarding no está firmado');
        }

        // Crear usuario en la tabla users
        const { error: userError } = await supabase
          .from('users')
          .insert({
            email: onboarding.email,
            role: 'junior', // Rol por defecto
            org_id: onboarding.org_id,
            department_id: onboarding.department_id,
            is_active: true,
            personal_data: onboarding.personal_data,
            contact_data: onboarding.contact_data,
            banking_data: onboarding.banking_data,
            job_data: onboarding.job_data
          });

        if (userError) {
          console.error('Error creating user:', userError);
        }

        // Marcar onboarding como completado
        const { error: completeError } = await supabase
          .from('employee_onboarding')
          .update({
            status: 'completed',
            completed_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', onboarding.id);

        if (completeError) {
          throw completeError;
        }

        // TODO: Enviar email de bienvenida
        // TODO: Generar contrato PDF
        // TODO: Notificar a RH

        return new Response(
          JSON.stringify({ 
            success: true, 
            message: 'Onboarding completado exitosamente',
            redirect_url: '/employee-onboarding/success'
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

      default:
        throw new Error('Acción no válida');
    }

  } catch (error: any) {
    console.error('Error in employee-onboarding function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
};

// Función auxiliar para generar documentos de onboarding
async function generateOnboardingDocuments(supabase: any, onboardingData: any) {
  try {
    // Obtener templates activos para la organización
    const { data: templates, error: templatesError } = await supabase
      .from('employee_document_templates')
      .select('*')
      .eq('org_id', onboardingData.org_id)
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (templatesError || !templates || templates.length === 0) {
      console.log('No document templates found for organization');
      return;
    }

    // Preparar datos para reemplazar variables
    const variables = {
      first_name: onboardingData.personal_data?.first_name || '',
      last_name: onboardingData.personal_data?.last_name || '',
      dni: onboardingData.personal_data?.dni || '',
      email: onboardingData.email,
      position_title: onboardingData.position_title,
      start_date: new Date().toLocaleDateString('es-ES'),
      phone: onboardingData.contact_data?.phone || '',
      address: onboardingData.contact_data?.address || '',
      bank_name: onboardingData.banking_data?.bank_name || '',
      iban: onboardingData.banking_data?.iban || ''
    };

    // Generar documentos para cada template
    for (const template of templates) {
      let content = template.template_content;
      
      // Reemplazar variables en el contenido
      Object.entries(variables).forEach(([key, value]) => {
        const regex = new RegExp(`{{${key}}}`, 'g');
        content = content.replace(regex, String(value));
      });

      // Crear documento en la base de datos
      const { error: docError } = await supabase
        .from('employee_onboarding_documents')
        .insert({
          onboarding_id: onboardingData.id,
          template_id: template.id,
          org_id: onboardingData.org_id,
          document_name: template.name,
          content: content,
          requires_signature: template.requires_signature,
          status: template.requires_signature ? 'pending' : 'completed'
        });

      if (docError) {
        console.error('Error creating document:', docError);
      }
    }
  } catch (error) {
    console.error('Error generating onboarding documents:', error);
  }
}

serve(handler);