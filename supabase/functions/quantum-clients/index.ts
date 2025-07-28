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
    'c.b.', 'cb.', 'cb', 'c.b', 'comunidad de bienes',
    's.c.', 'sc.', 'sc', 's.c', 'sociedad colectiva',
    's.coop.', 'scoop.', 'cooperativa',
    'fundacion', 'fundación', 'asociacion', 'asociación',
    'ayuntamiento', 'diputacion', 'diputación', 'junta',
    'empresa', 'sociedad', 'comercial', 'industrial',
    'consulting', 'consultoria', 'consultoría', 'servicios',
    'construcciones', 'inmobiliaria', 'promociones'
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
  console.log('🤖 Procesando sincronización automática...');
  
  try {
    // Obtener todas las organizaciones activas
    const { data: orgs, error: orgsError } = await supabase
      .from('organizations')
      .select('id')
      .limit(1);
    
    if (orgsError || !orgs || orgs.length === 0) {
      throw new Error('No se pudo obtener la organización');
    }
    
    const orgId = orgs[0].id;
    
    // Obtener contactos existentes para detectar duplicados (mejorado)
    const { data: existingContacts, error: contactsError } = await supabase
      .from('contacts')
      .select('email, dni_nif, name, phone, quantum_customer_id')
      .eq('org_id', orgId);
    
    if (contactsError) {
      throw new Error(`Error al obtener contactos existentes: ${contactsError.message}`);
    }
    
    // Detectar contactos nuevos (no duplicados) con lógica mejorada
    const newContacts = [];
    const skippedContacts = [];
    const entityTypeStats = { empresas: 0, particulares: 0 };
    
    for (const customer of customers) {
      // Verificar duplicados con lógica mejorada usando normalización
      const isDuplicate = existingContacts.some(contact => {
        // Normalizar datos para comparación
        const customerEmail = normalizeEmail(customer.email || '');
        const customerNif = normalizeNif(customer.nif || '');
        const customerPhone = normalizePhone(customer.phone || '');
        const customerName = normalizeText(customer.name || '');
        
        // Prioridad 1: quantum_customer_id (más confiable)
        if (customer.customerId && contact.quantum_customer_id === customer.customerId) {
          return true;
        }
        
        // Prioridad 2: DNI/NIF exacto con normalización
        if (customerNif && contact.dni_nif) {
          const contactNif = normalizeNif(contact.dni_nif);
          if (customerNif === contactNif && customerNif.length > 3) {
            return true;
          }
        }
        
        // Prioridad 3: Email exacto con normalización
        if (customerEmail && contact.email) {
          const contactEmail = normalizeEmail(contact.email);
          if (customerEmail === contactEmail && customerEmail.length > 5) {
            return true;
          }
        }
        
        // Prioridad 4: Nombre exacto + teléfono con normalización
        if (customerPhone && contact.phone && customerName && contact.name) {
          const contactPhone = normalizePhone(contact.phone);
          const contactName = normalizeText(contact.name);
          
          if (customerPhone === contactPhone && 
              customerName === contactName && 
              customerPhone.length >= 9 && 
              customerName.length > 3) {
            return true;
          }
        }
        
        return false;
      });
      
      if (isDuplicate) {
        skippedContacts.push(customer);
        console.log(`⏭️ Omitiendo duplicado: ${customer.name}`);
      } else {
        newContacts.push(customer);
        // Contar tipos de entidad
        const entityType = detectEntityType(customer);
        entityTypeStats[entityType === 'empresa' ? 'empresas' : 'particulares']++;
      }
    }
    
    console.log(`📊 Análisis: ${newContacts.length} nuevos, ${skippedContacts.length} duplicados`);
    console.log(`🏢 Tipos detectados: ${entityTypeStats.empresas} empresas, ${entityTypeStats.particulares} particulares`);
    
    // Importar solo contactos nuevos con clasificación correcta
    const importedContacts = [];
    for (const customer of newContacts) {
      const entityType = detectEntityType(customer);
      
        const contactData = {
          org_id: orgId,
          name: customer.name,
          email: customer.email || null,
          phone: customer.phone || null,
          dni_nif: customer.nif || null,
          address_street: [customer.streetType, customer.streetName, customer.streetNumber]
            .filter(Boolean).join(' ') || null,
          address_postal_code: customer.postCode || null,
          client_type: entityType, // Usar detección automática de tipo
          relationship_type: 'cliente', // CAMBIO: Todos los de Quantum son clientes
          source: 'quantum_auto',
          auto_imported_at: new Date().toISOString(),
          quantum_customer_id: customer.customerId,
          status: 'activo'
        };
      
      const { data: insertedContact, error: insertError } = await supabase
        .from('contacts')
        .insert(contactData)
        .select()
        .single();
      
      if (insertError) {
        console.error('❌ Error al importar contacto:', customer.name, insertError);
      } else {
        importedContacts.push(insertedContact);
        console.log('✅ Contacto importado:', customer.name);
      }
    }
    
    // Registrar notificación de sincronización
    await supabase.from('quantum_sync_notifications').insert({
      org_id: orgId,
      contacts_imported: importedContacts.length,
      contacts_skipped: skippedContacts.length,
      status: 'success',
      sync_date: new Date().toISOString()
    });
    
    // Registrar en historial
    await supabase.from('quantum_sync_history').insert({
      status: 'success',
      message: `Sincronización automática: ${importedContacts.length} importados, ${skippedContacts.length} omitidos`,
      records_processed: customers.length,
      sync_date: new Date().toISOString()
    });
    
    console.log('🎉 Sincronización automática completada');
    
    return new Response(
      JSON.stringify({ 
        success: true,
        data: {
          total_customers: customers.length,
          imported: importedContacts.length,
          skipped: skippedContacts.length,
          authMethod,
          endpoint,
          auto_sync: true
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
    
  } catch (error) {
    console.error('❌ Error en sincronización automática:', error);
    
    // Registrar error en notificaciones
    try {
      const { data: orgs } = await supabase.from('organizations').select('id').limit(1);
      if (orgs && orgs.length > 0) {
        await supabase.from('quantum_sync_notifications').insert({
          org_id: orgs[0].id,
          contacts_imported: 0,
          contacts_skipped: 0,
          status: 'error',
          error_message: error.message,
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
      throw new Error(`Error al conectar con Quantum Economics: ${fetchError.message}`);
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
    try {
      await supabase.from('quantum_sync_history').insert({
        status: 'error',
        message: `Error al obtener clientes: ${error.message}`,
        records_processed: 0,
        error_details: { error: error.message, stack: error.stack },
        sync_date: new Date().toISOString()
      });
    } catch (historyError) {
      console.error('⚠️ Error al registrar historial de error:', historyError);
    }
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message || 'Error interno del servidor'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});