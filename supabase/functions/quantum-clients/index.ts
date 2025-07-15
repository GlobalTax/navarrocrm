import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
    
    // Obtener contactos existentes para detectar duplicados
    const { data: existingContacts, error: contactsError } = await supabase
      .from('contacts')
      .select('email, dni_nif, name, phone, quantum_customer_id')
      .eq('org_id', orgId);
    
    if (contactsError) {
      throw new Error(`Error al obtener contactos existentes: ${contactsError.message}`);
    }
    
    // Detectar contactos nuevos (no duplicados)
    const newContacts = [];
    const skippedContacts = [];
    
    for (const customer of customers) {
      const isDuplicate = existingContacts.some(contact => {
        // Verificar por quantum_customer_id primero
        if (contact.quantum_customer_id === customer.customerId) return true;
        
        // Verificar por email
        if (customer.email && contact.email && 
            customer.email.toLowerCase() === contact.email.toLowerCase()) return true;
        
        // Verificar por DNI/NIF
        if (customer.nif && contact.dni_nif && 
            customer.nif.replace(/\D/g, '') === contact.dni_nif.replace(/\D/g, '')) return true;
        
        // Verificar por nombre y teléfono
        if (customer.name && contact.name && customer.phone && contact.phone &&
            customer.name.toLowerCase() === contact.name.toLowerCase() &&
            customer.phone.replace(/\D/g, '') === contact.phone.replace(/\D/g, '')) return true;
        
        return false;
      });
      
      if (isDuplicate) {
        skippedContacts.push(customer);
      } else {
        newContacts.push(customer);
      }
    }
    
    console.log(`📊 Análisis: ${newContacts.length} nuevos, ${skippedContacts.length} duplicados`);
    
    // Importar solo contactos nuevos
    const importedContacts = [];
    for (const customer of newContacts) {
      const contactData = {
        org_id: orgId,
        name: customer.name,
        email: customer.email || null,
        phone: customer.phone || null,
        dni_nif: customer.nif || null,
        address_street: [customer.streetType, customer.streetName, customer.streetNumber]
          .filter(Boolean).join(' ') || null,
        address_postal_code: customer.postCode || null,
        relationship_type: 'prospecto',
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