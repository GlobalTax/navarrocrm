import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ValidationRequest {
  data: any[];
  dataType: 'contacts' | 'users' | 'cases' | 'proposals';
  columns: string[];
}

interface ValidationResponse {
  validatedData: any[];
  errors: Array<{
    row: number;
    field: string;
    message: string;
    suggestion?: string;
  }>;
  suggestions: Array<{
    type: 'duplicate' | 'enhancement' | 'mapping';
    message: string;
    data?: any;
  }>;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { data, dataType, columns }: ValidationRequest = await req.json();

    console.log(`AI validation request for ${dataType} with ${data.length} rows`);

    // Crear prompt específico según el tipo de datos
    const validationPrompt = createValidationPrompt(dataType, columns, data.slice(0, 5)); // Muestra para análisis

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { 
            role: 'system', 
            content: `Eres un experto en validación y limpieza de datos para CRM legal. Analiza los datos y proporciona:
            1. Errores de validación específicos
            2. Sugerencias de corrección
            3. Detección de duplicados potenciales
            4. Mejoras de calidad de datos
            
            Responde SOLO en formato JSON válido con la estructura exacta solicitada.` 
          },
          { role: 'user', content: validationPrompt }
        ],
        temperature: 0.1,
      }),
    });

    const aiResponse = await response.json();
    const analysisResult = JSON.parse(aiResponse.choices[0].message.content);

    // Procesar cada fila con las recomendaciones de IA
    const validatedData: any[] = [];
    const errors: Array<{ row: number; field: string; message: string; suggestion?: string }> = [];

    data.forEach((row, index) => {
      const rowValidation = validateRowWithAI(row, index + 1, dataType, analysisResult);
      
      if (rowValidation.isValid) {
        validatedData.push(rowValidation.cleanedData);
      } else {
        errors.push(...rowValidation.errors);
      }
    });

    // Detectar duplicados inteligentemente
    const duplicateSuggestions = findIntelligentDuplicates(validatedData, dataType);

    const result: ValidationResponse = {
      validatedData,
      errors,
      suggestions: [
        ...analysisResult.suggestions || [],
        ...duplicateSuggestions
      ]
    };

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in AI bulk validation:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : String(error),
      validatedData: [],
      errors: [],
      suggestions: []
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function createValidationPrompt(dataType: string, columns: string[], sampleData: any[]): string {
  const schemas = {
    contacts: {
      required: ['name'],
      optional: ['email', 'phone', 'address_street', 'address_city', 'client_type', 'status'],
      validValues: {
        client_type: ['particular', 'empresa', 'autonomo'],
        status: ['activo', 'inactivo', 'prospecto', 'bloqueado'],
        relationship_type: ['prospecto', 'cliente', 'ex_cliente']
      }
    },
    users: {
      required: ['email', 'role'],
      optional: ['send_email', 'message'],
      validValues: {
        role: ['partner', 'area_manager', 'senior', 'junior', 'finance'],
        send_email: ['true', 'false', '1', '0', 'si', 'no']
      }
    }
  };

  const schema = schemas[dataType as keyof typeof schemas] || schemas.contacts;

  return `
Analiza estos datos para importación masiva de ${dataType}:

COLUMNAS DETECTADAS: ${columns.join(', ')}

ESQUEMA ESPERADO:
- Campos requeridos: ${schema.required.join(', ')}
- Campos opcionales: ${schema.optional.join(', ')}
- Valores válidos: ${JSON.stringify(schema.validValues, null, 2)}

MUESTRA DE DATOS (primeras 5 filas):
${JSON.stringify(sampleData, null, 2)}

Proporciona análisis en este formato JSON exacto:
{
  "columnMapping": {
    "detectedColumn": "standardColumn"
  },
  "validationRules": [
    {
      "field": "email",
      "rule": "format",
      "message": "Debe ser email válido"
    }
  ],
  "suggestions": [
    {
      "type": "enhancement",
      "message": "Se detectaron posibles duplicados basados en email"
    }
  ],
  "dataQualityIssues": [
    {
      "issue": "missing_required_fields",
      "count": 3,
      "fields": ["name"]
    }
  ]
}
`;
}

function validateRowWithAI(row: any, rowNumber: number, dataType: string, aiAnalysis: any) {
  const errors: Array<{ row: number; field: string; message: string; suggestion?: string }> = [];
  const cleanedData = { ...row };

  // Aplicar mapeo de columnas sugerido por IA
  if (aiAnalysis.columnMapping) {
    Object.entries(aiAnalysis.columnMapping).forEach(([detected, standard]) => {
      if (row[detected as string] && !row[standard as string]) {
        cleanedData[standard as string] = row[detected];
        delete cleanedData[detected];
      }
    });
  }

  // Validaciones básicas mejoradas con IA
  if (dataType === 'contacts') {
    // Validar nombre
    if (!cleanedData.name || cleanedData.name.trim() === '') {
      errors.push({
        row: rowNumber,
        field: 'name',
        message: 'El nombre es requerido',
        suggestion: 'Asegúrate de que cada contacto tenga un nombre válido'
      });
    }

    // Validar email con IA
    if (cleanedData.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(cleanedData.email)) {
        errors.push({
          row: rowNumber,
          field: 'email',
          message: 'Formato de email inválido',
          suggestion: `¿Quisiste decir ${suggestEmailCorrection(cleanedData.email)}?`
        });
      }
    }

    // Limpiar y normalizar datos
    if (cleanedData.phone) {
      cleanedData.phone = normalizePhone(cleanedData.phone);
    }
    
    if (cleanedData.name) {
      cleanedData.name = cleanedData.name.trim();
    }
  }

  return {
    isValid: errors.length === 0,
    cleanedData,
    errors
  };
}

function findIntelligentDuplicates(data: any[], dataType: string) {
  const suggestions: Array<{
    type: 'duplicate';
    message: string;
    data: { row1: number; row2: number };
  }> = [];
  const seen = new Map();

  data.forEach((row, index) => {
    const key = dataType === 'contacts' 
      ? `${row.email?.toLowerCase() || ''}-${row.name?.toLowerCase() || ''}`
      : `${row.email?.toLowerCase() || ''}`;

    if (seen.has(key)) {
      suggestions.push({
        type: 'duplicate' as const,
        message: `Posible duplicado detectado en fila ${index + 1} - similar a fila ${seen.get(key) + 1}`,
        data: { row1: seen.get(key) + 1, row2: index + 1 }
      });
    } else {
      seen.set(key, index);
    }
  });

  return suggestions;
}

function suggestEmailCorrection(email: string): string {
  // Correcciones comunes
  const commonFixes = {
    'gmial.com': 'gmail.com',
    'gmai.com': 'gmail.com',
    'yahooo.com': 'yahoo.com',
    'hotmial.com': 'hotmail.com'
  };

  let suggested = email;
  Object.entries(commonFixes).forEach(([wrong, correct]) => {
    suggested = suggested.replace(wrong, correct);
  });

  return suggested;
}

function normalizePhone(phone: string): string {
  // Limpiar y normalizar teléfono
  let normalized = phone.replace(/[^\d+]/g, '');
  
  // Si no empieza con +, añadir +34 para España
  if (!normalized.startsWith('+')) {
    normalized = '+34' + normalized;
  }
  
  return normalized;
}