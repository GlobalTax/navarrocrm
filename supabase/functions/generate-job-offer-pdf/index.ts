import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface JobOfferData {
  title: string;
  candidate_name: string;
  candidate_email: string;
  department?: string;
  position_level: string;
  work_schedule: string;
  work_location?: string;
  salary_amount?: number;
  salary_currency?: string;
  salary_period?: string;
  start_date?: string;
  responsibilities?: string[];
  requirements?: string[];
  benefits?: string[];
  contract_duration?: string;
  probation_period?: number;
  vacation_days?: number;
  remote_work_allowance?: boolean;
  additional_notes?: string;
}

const formatSalary = (amount?: number, currency?: string, period?: string): string => {
  if (!amount) return 'A convenir';
  const curr = currency || 'EUR';
  const per = period === 'monthly' ? 'mensuales' : 'anuales';
  return `${amount.toLocaleString()} ${curr} ${per}`;
};

const formatWorkSchedule = (schedule: string): string => {
  const schedules = {
    'full_time': 'Tiempo completo',
    'part_time': 'Tiempo parcial',
    'hybrid': 'Híbrido'
  };
  return schedules[schedule as keyof typeof schedules] || schedule;
};

const formatPositionLevel = (level: string): string => {
  const levels = {
    'junior': 'Junior',
    'senior': 'Senior',
    'manager': 'Manager',
    'director': 'Director'
  };
  return levels[level as keyof typeof levels] || level;
};

const generateJobOfferHTML = (data: JobOfferData): string => {
  return `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Propuesta de Incorporación - ${data.candidate_name}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background: #fff;
            max-width: 800px;
            margin: 0 auto;
            padding: 40px 20px;
        }
        
        .header {
            text-align: center;
            margin-bottom: 40px;
            padding-bottom: 20px;
            border-bottom: 3px solid #0061FF;
        }
        
        .header h1 {
            color: #0061FF;
            font-size: 2.2em;
            margin-bottom: 10px;
            font-weight: 600;
        }
        
        .header p {
            color: #666;
            font-size: 1.1em;
        }
        
        .section {
            margin-bottom: 30px;
            background: #f8f9fa;
            padding: 25px;
            border-radius: 10px;
            border-left: 4px solid #0061FF;
        }
        
        .section h2 {
            color: #0061FF;
            font-size: 1.4em;
            margin-bottom: 15px;
            font-weight: 600;
        }
        
        .info-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 15px;
        }
        
        .info-item {
            background: white;
            padding: 15px;
            border-radius: 8px;
            border: 1px solid #e1e5e9;
        }
        
        .info-item strong {
            color: #333;
            display: block;
            margin-bottom: 5px;
            font-weight: 600;
        }
        
        .info-item span {
            color: #666;
        }
        
        .list {
            background: white;
            padding: 20px;
            border-radius: 8px;
            border: 1px solid #e1e5e9;
        }
        
        .list ul {
            list-style: none;
            padding: 0;
        }
        
        .list li {
            padding: 8px 0;
            border-bottom: 1px solid #f0f0f0;
            position: relative;
            padding-left: 20px;
        }
        
        .list li:before {
            content: "✓";
            color: #2CBD6E;
            font-weight: bold;
            position: absolute;
            left: 0;
        }
        
        .list li:last-child {
            border-bottom: none;
        }
        
        .highlight {
            background: linear-gradient(135deg, #0061FF 0%, #4285F4 100%);
            color: white;
            padding: 20px;
            border-radius: 10px;
            text-align: center;
            margin: 30px 0;
        }
        
        .highlight h3 {
            font-size: 1.3em;
            margin-bottom: 10px;
        }
        
        .footer {
            text-align: center;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 2px solid #e1e5e9;
            color: #666;
            font-size: 0.9em;
        }
        
        @media print {
            body {
                padding: 20px;
            }
            .header {
                margin-bottom: 30px;
            }
            .section {
                margin-bottom: 20px;
                page-break-inside: avoid;
            }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Propuesta de Incorporación</h1>
        <p>Oferta de trabajo para ${data.candidate_name}</p>
    </div>

    <div class="section">
        <h2>Información del Puesto</h2>
        <div class="info-grid">
            <div class="info-item">
                <strong>Puesto:</strong>
                <span>${data.title}</span>
            </div>
            <div class="info-item">
                <strong>Departamento:</strong>
                <span>${data.department || 'No especificado'}</span>
            </div>
            <div class="info-item">
                <strong>Nivel:</strong>
                <span>${formatPositionLevel(data.position_level)}</span>
            </div>
            <div class="info-item">
                <strong>Modalidad:</strong>
                <span>${formatWorkSchedule(data.work_schedule)}</span>
            </div>
        </div>
    </div>

    <div class="section">
        <h2>Información del Candidato</h2>
        <div class="info-grid">
            <div class="info-item">
                <strong>Nombre:</strong>
                <span>${data.candidate_name}</span>
            </div>
            <div class="info-item">
                <strong>Email:</strong>
                <span>${data.candidate_email}</span>
            </div>
        </div>
    </div>

    <div class="highlight">
        <h3>💰 Oferta Salarial</h3>
        <p style="font-size: 1.2em; margin: 0;">${formatSalary(data.salary_amount, data.salary_currency, data.salary_period)}</p>
    </div>

    <div class="section">
        <h2>Condiciones Laborales</h2>
        <div class="info-grid">
            <div class="info-item">
                <strong>Ubicación:</strong>
                <span>${data.work_location || 'Por determinar'}</span>
            </div>
            <div class="info-item">
                <strong>Fecha de inicio:</strong>
                <span>${data.start_date ? new Date(data.start_date).toLocaleDateString('es-ES') : 'Por acordar'}</span>
            </div>
            <div class="info-item">
                <strong>Duración del contrato:</strong>
                <span>${data.contract_duration || 'Indefinido'}</span>
            </div>
            <div class="info-item">
                <strong>Período de prueba:</strong>
                <span>${data.probation_period ? `${data.probation_period} meses` : 'Según convenio'}</span>
            </div>
            <div class="info-item">
                <strong>Días de vacaciones:</strong>
                <span>${data.vacation_days ? `${data.vacation_days} días` : 'Según convenio'}</span>
            </div>
            <div class="info-item">
                <strong>Trabajo remoto:</strong>
                <span>${data.remote_work_allowance ? 'Permitido' : 'Presencial'}</span>
            </div>
        </div>
    </div>

    ${data.responsibilities && data.responsibilities.length > 0 ? `
    <div class="section">
        <h2>Responsabilidades Principales</h2>
        <div class="list">
            <ul>
                ${data.responsibilities.map(resp => `<li>${resp}</li>`).join('')}
            </ul>
        </div>
    </div>
    ` : ''}

    ${data.requirements && data.requirements.length > 0 ? `
    <div class="section">
        <h2>Requisitos</h2>
        <div class="list">
            <ul>
                ${data.requirements.map(req => `<li>${req}</li>`).join('')}
            </ul>
        </div>
    </div>
    ` : ''}

    ${data.benefits && data.benefits.length > 0 ? `
    <div class="section">
        <h2>Beneficios</h2>
        <div class="list">
            <ul>
                ${data.benefits.map(benefit => `<li>${benefit}</li>`).join('')}
            </ul>
        </div>
    </div>
    ` : ''}

    ${data.additional_notes ? `
    <div class="section">
        <h2>Información Adicional</h2>
        <div class="info-item">
            <p>${data.additional_notes}</p>
        </div>
    </div>
    ` : ''}

    <div class="footer">
        <p>Documento generado automáticamente el ${new Date().toLocaleDateString('es-ES')}</p>
        <p>Esta propuesta es confidencial y está destinada únicamente a ${data.candidate_name}</p>
    </div>
</body>
</html>`;
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { jobOfferData } = await req.json();
    console.log('Generating PDF for job offer:', jobOfferData);

    if (!jobOfferData) {
      return new Response(
        JSON.stringify({ error: 'Missing job offer data' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate HTML content
    const htmlContent = generateJobOfferHTML(jobOfferData);
    console.log('Generated HTML content');

    // Create a filename based on candidate name and current date
    const safeFileName = `propuesta-incorporacion-${jobOfferData.candidate_name?.replace(/[^a-zA-Z0-9]/g, '-')}-${new Date().getTime()}.html`;
    
    // Upload HTML to storage
    const { data: uploadData, error: uploadError } = await supabaseClient.storage
      .from('employee-documents')
      .upload(safeFileName, new Blob([htmlContent], { type: 'text/html' }), {
        contentType: 'text/html',
        upsert: true
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return new Response(
        JSON.stringify({ error: 'Failed to upload document' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get public URL
    const { data: publicUrlData } = supabaseClient.storage
      .from('employee-documents')
      .getPublicUrl(uploadData.path);

    console.log('Document uploaded successfully:', publicUrlData.publicUrl);

    return new Response(
      JSON.stringify({ 
        success: true, 
        documentUrl: publicUrlData.publicUrl,
        fileName: safeFileName
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-job-offer-pdf function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});