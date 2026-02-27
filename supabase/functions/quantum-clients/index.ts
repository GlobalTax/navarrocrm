import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Utility functions for normalization and duplicate detection
const normalizeText = (text: string): string => {
  if (!text) return ''
  
  return text
    .toLowerCase()
    .trim()
    .normalize('NFD') // Descomponer caracteres acentuados
    .replace(/[\u0300-\u036f]/g, '') // Remover diacríticos (tildes, acentos)
    .replace(/[^\w\s]/g, '') // Remover caracteres especiales
    .replace(/\s+/g, ' ') // Normalizar espacios múltiples
}

const normalizeNif = (nif: string): string => {
  if (!nif) return ''
  
  return nif
    .replace(/[\s-]/g, '') // Remover espacios y guiones
    .toUpperCase()
    .trim()
}

const normalizeEmail = (email: string): string => {
  if (!email) return ''
  
  return email
    .toLowerCase()
    .trim()
}

const normalizePhone = (phone: string): string => {
  if (!phone) return ''
  
  return phone.replace(/\D/g, '') // Solo números
}

interface QuantumCustomer {
  regid: string;
  nif: string;
  name: string;
  countryISO?: string;
  customerId: string;
  email?: string;
  phone?: string;
  streetType?: string;
  streetName?: string;
  streetNumber?: string;
  staircase?: string;
  floor?: string;
  room?: string;
  postCode?: string;
  cityCode?: string;
  iban?: string;
  swift?: string;
  paymentMethod?: string;
  family?: number;
  mandateReference?: string;
  mandateDate?: string;
  [key: string]: any;
}

interface QuantumResponse {
  error?: {
    message: string;
    errorCode: string;
  };
  apiVersion?: string;
  customers?: QuantumCustomer[];
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Función para procesar sincronización automática
// Función para detectar tipo de entidad (empresa o persona física)
function detectEntityType(customer: QuantumCustomer): 'empresa' | 'particular' {
  const name = customer.name?.toLowerCase() || '';
  const nif = customer.nif || '';
  
  // Detectar por palabras clave en el nombre
  const companyKeywords = [
    's.l.', 'sl.', 'sl', 's.l', 'sociedad limitada',
    's.a.', 'sa.', 'sa', 's.a', 'sociedad anónima', 
    's.l.u.', 'slu.', 'slu', 's.l.u', 'sociedad limitada unipersonal',
    's.l.p.', 'slp.', 'slp', 's.l.p', 'sociedad limitada profesional',
    'c.b.', 'cb.', 'cb', 'c.b', 'comunidad de bienes',
    's.c.', 'sc.', 'sc', 's.c', 'sociedad colectiva',
    's.coop.', 'scoop.', 'cooperativa',
    'b.v.', 'bv', 'b.v',
    'sas', 'srl',
    'scp',
    'fundacion', 'fundación', 'asociacion', 'asociación',
    'ayuntamiento', 'diputacion', 'diputación', 'junta',
    'empresa', 'sociedad', 'comercial', 'industrial',
    'consulting', 'consultoria', 'consultoría', 'servicios',
    'construcciones', 'inmobiliaria', 'promociones',
    'cdad. de prop', 'cdad de prop', 'comunidad de prop',
    'misioneras', 'monasterio', 'clarisas'
  ];
  
  // Verificar si el nombre contiene palabras clave de empresa
  const hasCompanyKeyword = companyKeywords.some(keyword => 
    name.includes(keyword)
  );
  
  // Detectar por NIF/CIF - las empresas suelen empezar con letras específicas
  const companyCifLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'N', 'P', 'Q', 'R', 'S', 'U', 'V', 'W'];
  const firstChar = nif.charAt(0).toUpperCase();
  const hasCompanyCif = companyCifLetters.includes(firstChar);
  
  // Logging para debug
  console.log(`🔍 Analizando entidad: "${customer.name}" | NIF: "${nif}" | Keyword: ${hasCompanyKeyword} | CIF: ${hasCompanyCif}`);
  
  return (hasCompanyKeyword || hasCompanyCif) ? 'empresa' : 'particular';
}

async function processAutomaticSync(supabase: any, customers: QuantumCustomer[], authMethod: string, endpoint: string) {
  console.log('🤖 Procesando sincronización automática con upsert...');
  
  try {
    const { data: orgs, error: orgsError } = await supabase
      .from('organizations')
      .select('id')
      .limit(1);
    
    if (orgsError || !orgs || orgs.length === 0) {
      throw new Error('No se pudo obtener la organización');
    }
    
    const orgId = orgs[0].id;
    
    // Preparar todos los contactos válidos para upsert
    const validContacts: any[] = [];
    let skipped = 0;
    
    for (const customer of customers) {
      if (!customer.name?.trim()) {
        skipped++;
        console.log(`⏭️ Omitido por nombre vacío: regid=${customer.regid}`);
        continue;
      }
      
      const entityType = detectEntityType(customer);
      
      validContacts.push({
        org_id: orgId,
        name: customer.name.trim(),
        email: customer.email || null,
        phone: customer.phone || null,
        dni_nif: customer.nif || null,
        address_street: [customer.streetType, customer.streetName, customer.streetNumber]
          .filter(Boolean).join(' ') || null,
        address_postal_code: customer.postCode || null,
        client_type: entityType,
        relationship_type: 'cliente',
        source: 'quantum_auto',
        auto_imported_at: new Date().toISOString(),
        quantum_customer_id: customer.customerId,
        status: 'activo',
        updated_at: new Date().toISOString()
      });
    }
    
    console.log(`📊 Contactos válidos: ${validContacts.length}, omitidos: ${skipped}`);
    
    // Upsert en batches de 100
    const BATCH_SIZE = 100;
    let upserted = 0;
    let errors = 0;
    
    for (let i = 0; i < validContacts.length; i += BATCH_SIZE) {
      const batch = validContacts.slice(i, i + BATCH_SIZE);
      
      const { error: upsertError } = await supabase
        .from('contacts')
        .upsert(batch, { 
          onConflict: 'org_id,quantum_customer_id',
          ignoreDuplicates: false 
        });
      
      if (upsertError) {
        console.error(`❌ Error en batch ${Math.floor(i / BATCH_SIZE) + 1}:`, upsertError.message);
        errors += batch.length;
      } else {
        upserted += batch.length;
        console.log(`✅ Batch ${Math.floor(i / BATCH_SIZE) + 1}: ${batch.length} contactos procesados`);
      }
    }
    
    console.log(`🎉 Sincronización completada: ${upserted} importados/actualizados, ${skipped} omitidos, ${errors} errores`);
    
    // Registrar notificación
    await supabase.from('quantum_sync_notifications').insert({
      org_id: orgId,
      contacts_imported: upserted,
      contacts_skipped: skipped,
      status: errors > 0 ? 'partial' : 'success',
      sync_date: new Date().toISOString()
    });
    
    // Registrar en historial
    await supabase.from('quantum_sync_history').insert({
      status: errors > 0 ? 'partial' : 'success',
      message: `Sincronización automática: ${upserted} importados/actualizados, ${skipped} omitidos, ${errors} errores`,
      records_processed: customers.length,
      sync_date: new Date().toISOString()
    });
    
    return new Response(
      JSON.stringify({ 
        success: true,
        data: {
          total_customers: customers.length,
          imported: upserted,
          skipped: skipped,
          errors: errors,
          authMethod,
          endpoint,
          auto_sync: true
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('❌ Error en sincronización automática:', error);
    
    try {
      const { data: orgs } = await supabase.from('organizations').select('id').limit(1);
      if (orgs && orgs.length > 0) {
        await supabase.from('quantum_sync_notifications').insert({
          org_id: orgs[0].id,
          contacts_imported: 0,
          contacts_skipped: 0,
          status: 'error',
          error_message: error instanceof Error ? error.message : String(error),
          sync_date: new Date().toISOString()
        });
      }
    } catch (notifError) {
      console.error('❌ Error al registrar notificación de error:', notifError);
    }
    
    throw error;
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Comprobar si es sincronización automática
    let autoSync = false;
    if (req.method === 'POST') {
      try {
        const body = await req.json();
        autoSync = body.auto_sync === true;
      } catch (e) {
        // Si no se puede parsear el body, continuar como manual
      }
    }

    console.log(autoSync ? '🤖 Sincronización automática de Quantum Economics' : '🚀 Obteniendo clientes de Quantum Economics');
    
    // Inicializar cliente Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Configuración de Supabase incompleta');
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Obtener credenciales de Quantum desde secretos
    const quantumToken = Deno.env.get('quantum_api_token');
    const companyId = '28171';
    
    console.log('🔑 Verificando credenciales...');
    console.log('Token presente:', quantumToken ? 'SÍ' : 'NO');
    console.log('Company ID:', companyId);

    if (!quantumToken) {
      const errorMsg = 'Error: Token de Quantum Economics no configurado.';
      console.error('❌', errorMsg);
      
      return new Response(
        JSON.stringify({ 
          success: false,
          error: errorMsg
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Usar el endpoint correcto según la documentación de Quantum Economics
    const endpoint = `https://app.quantumeconomics.es/contabilidad/ws/customer?companyId=${companyId}`;

    console.log('📡 Llamando endpoint:', endpoint);
    
    let response: Response;
    let authMethod = '';
    
    try {
      // Primer intento: Bearer
      console.log('🔐 Intentando autenticación Bearer...');
      response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${quantumToken}`,
          'Accept': 'application/json',
          'User-Agent': 'Supabase-Edge-Function/1.0'
        }
      });
      authMethod = 'Bearer';
      
      if (!response.ok) {
        console.log('⚠️ Bearer falló, intentando API-KEY...');
        // Segundo intento: API-KEY
        response = await fetch(endpoint, {
          method: 'GET',
          headers: {
            'Authorization': `API-KEY ${quantumToken}`,
            'Accept': 'application/json',
            'User-Agent': 'Supabase-Edge-Function/1.0'
          }
        });
        authMethod = 'API-KEY';
      }
      
      if (!response.ok) {
        throw new Error(`API de Quantum falló con status: ${response.status}`);
      }
      
      console.log('✅ Endpoint exitoso con método:', authMethod);
      
    } catch (fetchError) {
      console.error('❌ Error en fetch:', fetchError);
      throw new Error(`Error al conectar con Quantum Economics: ${fetchError instanceof Error ? fetchError.message : String(fetchError)}`);
    }

    console.log('📊 Respuesta API status:', response.status, 'con método:', authMethod);

    let data: QuantumResponse;
    try {
      data = await response.json();
    } catch (jsonError) {
      const errorMsg = 'Error: La respuesta de la API no es JSON válido.';
      console.error('❌', errorMsg, jsonError);
      
      return new Response(
        JSON.stringify({ 
          success: false,
          error: errorMsg
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('📋 Estructura de respuesta:', Object.keys(data));

    // Verificar si hay error en la respuesta - errorCode "0" significa éxito
    if (data.error && data.error.errorCode && data.error.errorCode !== "0") {
      const errorMsg = `Error de Quantum API: ${data.error.message} (Código: ${data.error.errorCode})`;
      console.error('❌', errorMsg);
      
      return new Response(
        JSON.stringify({ 
          success: false,
          error: errorMsg
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Log para debug: mostrar error con código 0 (éxito)
    if (data.error && data.error.errorCode === "0") {
      console.log('✅ Respuesta exitosa de Quantum API:', data.error.message, '(Código:', data.error.errorCode + ')');
    }

    // Verificar estructura de respuesta según la documentación
    const customers = data.customers;
    if (!customers || !Array.isArray(customers)) {
      const errorMsg = 'Error: La respuesta de la API no contiene customers válidos.';
      console.error('❌', errorMsg, 'Respuesta completa:', data);
      
      return new Response(
        JSON.stringify({ 
          success: false,
          error: errorMsg,
          debug: {
            responseKeys: Object.keys(data),
            hasCustomers: !!data.customers,
            isArray: Array.isArray(data.customers)
          }
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log(`📋 Obtenidos ${customers.length} customers de Quantum Economics`);

    // Si es sincronización automática, procesar e importar contactos nuevos
    if (autoSync) {
      return await processAutomaticSync(supabase, customers, authMethod, endpoint);
    }

    // Registrar sincronización en el historial
    try {
      await supabase.from('quantum_sync_history').insert({
        status: 'success',
        message: `Obtenidos ${customers.length} customers exitosamente`,
        records_processed: customers.length,
        sync_date: new Date().toISOString()
      });
    } catch (historyError) {
      console.error('⚠️ Error al registrar historial:', historyError);
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        data: {
          customers: customers,
          total: customers.length,
          authMethod,
          endpoint: endpoint
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('❌ Error general al obtener clientes:', error);
    
    // Registrar error en el historial
    const errorSupabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
    try {
      await errorSupabase.from('quantum_sync_history').insert({
        status: 'error',
        message: `Error al obtener clientes: ${error instanceof Error ? error.message : String(error)}`,
        records_processed: 0,
        error_details: { 
          error: error instanceof Error ? error.message : String(error), 
          stack: error instanceof Error ? error.stack : undefined 
        },
        sync_date: new Date().toISOString()
      });
    } catch (historyError) {
      console.error('⚠️ Error al registrar historial de error:', historyError);
    }
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error instanceof Error ? error.message : String(error) || 'Error interno del servidor'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});