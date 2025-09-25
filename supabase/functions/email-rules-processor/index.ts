import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ProcessRulesRequest {
  org_id: string
  message_id?: string
  process_all_pending?: boolean
}

interface EmailRule {
  id: string
  org_id: string
  user_id: string
  rule_name: string
  is_active: boolean
  conditions: any[]
  actions: any[]
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { org_id, message_id, process_all_pending = false }: ProcessRulesRequest = await req.json()

    console.log(`Procesando reglas de email para org: ${org_id}`)

    // 1. Obtener reglas activas
    const { data: activeRules } = await supabase
      .from('email_rules')
      .select('*')
      .eq('org_id', org_id)
      .eq('is_active', true)
      .order('created_at', { ascending: true })

    if (!activeRules || activeRules.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No hay reglas activas para procesar' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 2. Obtener mensajes a procesar
    let messagesToProcess

    if (message_id) {
      // Procesar mensaje específico
      const { data } = await supabase
        .from('email_messages')
        .select(`
          *,
          email_threads (
            subject,
            auto_assigned_client_id,
            priority_level,
            tags
          )
        `)
        .eq('id', message_id)
        .eq('org_id', org_id)
        .single()
      
      messagesToProcess = data ? [data] : []
    } else if (process_all_pending) {
      // Procesar todos los mensajes sin procesar
      const { data } = await supabase
        .from('email_messages')
        .select(`
          *,
          email_threads (
            subject,
            auto_assigned_client_id,
            priority_level,
            tags
          )
        `)
        .eq('org_id', org_id)
        .is('sync_status', 'synced')
        .order('received_datetime', { ascending: false })
        .limit(100)
      
      messagesToProcess = data || []
    } else {
      throw new Error('Debe especificar message_id o process_all_pending')
    }

    let processedCount = 0
    let rulesApplied = 0

    // 3. Procesar cada mensaje con todas las reglas
    for (const message of messagesToProcess) {
      console.log(`Procesando mensaje: ${message.subject}`)
      
      for (const rule of activeRules) {
        const ruleMatches = await evaluateRule(rule, message)
        
        if (ruleMatches) {
          console.log(`Aplicando regla: ${rule.rule_name}`)
          await executeRuleActions(supabase, rule, message)
          rulesApplied++
          
          // Actualizar contador de ejecución de la regla
          await supabase
            .from('email_rules')
            .update({ 
              execution_count: rule.execution_count + 1,
              last_executed_at: new Date().toISOString()
            })
            .eq('id', rule.id)
        }
      }
      
      processedCount++
    }

    console.log(`Procesamiento completado. ${processedCount} mensajes, ${rulesApplied} reglas aplicadas`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        processed_messages: processedCount,
        rules_applied: rulesApplied
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error en email-rules-processor:', error)
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : String(error) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

async function evaluateRule(rule: EmailRule, message: any): Promise<boolean> {
  const conditions = rule.conditions || []
  
  // Si no hay condiciones, la regla no se aplica
  if (conditions.length === 0) return false

  // Evaluar cada condición (AND lógico por defecto)
  for (const condition of conditions) {
    const matches = await evaluateCondition(condition, message)
    if (!matches) return false
  }

  return true
}

async function evaluateCondition(condition: any, message: any): Promise<boolean> {
  const { field, operator, value } = condition

  let fieldValue: any

  // Obtener valor del campo
  switch (field) {
    case 'from_address':
      fieldValue = message.from_address?.toLowerCase()
      break
    case 'to_addresses':
      fieldValue = message.to_addresses?.join(' ').toLowerCase()
      break
    case 'subject':
      fieldValue = message.subject?.toLowerCase()
      break
    case 'body_text':
    case 'body_html':
      fieldValue = message[field]?.toLowerCase()
      break
    case 'has_attachments':
      fieldValue = message.has_attachments
      break
    case 'message_type':
      fieldValue = message.message_type
      break
    default:
      return false
  }

  const compareValue = value?.toLowerCase()

  // Evaluar operador
  switch (operator) {
    case 'contains':
      return fieldValue?.includes(compareValue) || false
    case 'equals':
      return fieldValue === compareValue
    case 'starts_with':
      return fieldValue?.startsWith(compareValue) || false
    case 'ends_with':
      return fieldValue?.endsWith(compareValue) || false
    case 'not_contains':
      return !fieldValue?.includes(compareValue)
    case 'is_true':
      return fieldValue === true
    case 'is_false':
      return fieldValue === false
    default:
      return false
  }
}

async function executeRuleActions(supabase: any, rule: EmailRule, message: any) {
  const actions = rule.actions || []

  for (const action of actions) {
    try {
      await executeAction(supabase, action, message, rule.org_id)
    } catch (error) {
      console.error(`Error ejecutando acción ${action.type}:`, error)
    }
  }
}

async function executeAction(supabase: any, action: any, message: any, org_id: string) {
  const { type, parameters } = action

  switch (type) {
    case 'assign_client':
      await assignMessageToClient(supabase, message, parameters.client_id, org_id)
      break

    case 'add_tags':
      await addTagsToThread(supabase, message.thread_id, parameters.tags, org_id)
      break

    case 'set_priority':
      await setPriority(supabase, message.thread_id, parameters.priority, org_id)
      break

    case 'move_to_folder':
      await moveToFolder(supabase, message.id, parameters.folder_name, org_id)
      break

    case 'forward_email':
      await forwardEmail(supabase, message, parameters.forward_to, org_id)
      break

    case 'create_task':
      await createTaskFromEmail(supabase, message, parameters, org_id)
      break

    case 'auto_reply':
      await sendAutoReply(supabase, message, parameters.template, org_id)
      break

    default:
      console.log(`Acción no reconocida: ${type}`)
  }
}

async function assignMessageToClient(supabase: any, message: any, client_id: string, org_id: string) {
  // Verificar que el cliente existe
  const { data: client } = await supabase
    .from('contacts')
    .select('id')
    .eq('id', client_id)
    .eq('org_id', org_id)
    .single()

  if (client) {
    await supabase
      .from('email_threads')
      .update({ auto_assigned_client_id: client_id })
      .eq('id', message.thread_id)
  }
}

async function addTagsToThread(supabase: any, thread_id: string, tags: string[], org_id: string) {
  const { data: thread } = await supabase
    .from('email_threads')
    .select('tags')
    .eq('id', thread_id)
    .single()

  const existingTags = thread?.tags || []
  const newTags = [...new Set([...existingTags, ...tags])]

  await supabase
    .from('email_threads')
    .update({ tags: newTags })
    .eq('id', thread_id)
}

async function setPriority(supabase: any, thread_id: string, priority: string, org_id: string) {
  await supabase
    .from('email_threads')
    .update({ priority_level: priority })
    .eq('id', thread_id)
}

async function moveToFolder(supabase: any, message_id: string, folder_name: string, org_id: string) {
  // Esta función requeriría llamar a Microsoft Graph para mover el mensaje
  // Por ahora solo registramos la intención
  console.log(`Solicitud de mover mensaje ${message_id} a carpeta ${folder_name}`)
}

async function forwardEmail(supabase: any, message: any, forward_to: string, org_id: string) {
  // Llamar a outlook-email-send para reenviar
  await supabase.functions.invoke('outlook-email-send', {
    body: {
      user_id: message.user_id,
      org_id: org_id,
      to: [forward_to],
      subject: `Fwd: ${message.subject}`,
      body_html: `<p>---------- Mensaje reenviado ----------</p>${message.body_html}`,
      body_text: `---------- Mensaje reenviado ----------\n${message.body_text}`
    }
  })
}

async function createTaskFromEmail(supabase: any, message: any, parameters: any, org_id: string) {
  await supabase
    .from('tasks')
    .insert({
      org_id,
      title: parameters.task_title || `Responder: ${message.subject}`,
      description: `Email de: ${message.from_address}\nAsunto: ${message.subject}`,
      priority: parameters.priority || 'medium',
      status: 'pending',
      due_date: parameters.due_date,
      assigned_to: parameters.assigned_to
    })
}

async function sendAutoReply(supabase: any, message: any, template: string, org_id: string) {
  // Implementar respuesta automática usando plantilla
  console.log(`Enviando respuesta automática para mensaje: ${message.subject}`)
  
  // Aquí se podría llamar a outlook-email-send con la plantilla procesada
}