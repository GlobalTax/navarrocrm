import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

type ReminderType = 'modelo600' | 'asiento' | 'calificacion'

interface ReqBody {
  org_id?: string
  dryRun?: boolean
}

function toDateOnly(d: Date | string): Date {
  const x = new Date(d)
  return new Date(x.getFullYear(), x.getMonth(), x.getDate())
}

function addDays(d: Date, n: number): Date {
  const x = new Date(d)
  x.setDate(x.getDate() + n)
  return x
}

function diffDays(a: Date, b: Date): number {
  const ms = toDateOnly(a).getTime() - toDateOnly(b).getTime()
  return Math.round(ms / (1000 * 60 * 60 * 24))
}

function fmt(date: Date | string): string {
  const d = new Date(date)
  return d.toISOString().slice(0, 10)
}

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') as string
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') as string

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)

async function upsertReminderLog(org_id: string, deed_id: string, type: ReminderType, days_before: number) {
  const { error } = await supabase
    .from('deed_reminder_logs')
    .insert([{ org_id, deed_id, reminder_type: type, days_before }])

  if (error) {
    // Ignore duplicate unique constraint
    if ((error as any).code === '23505') return { inserted: false }
    console.error('Error inserting reminder log', { deed_id, type, days_before, error })
    throw error
  }
  return { inserted: true }
}

async function getRecipientsByDeed(deedIds: string[]): Promise<Record<string, string | null>> {
  if (deedIds.length === 0) return {}

  // Get assignees
  const { data: assignees, error: assigneesErr } = await supabase
    .from('deed_assignees')
    .select('deed_id, user_id')
    .in('deed_id', deedIds)

  if (assigneesErr) {
    console.error('Error fetching deed assignees', assigneesErr)
    return {}
  }

  const userIds = Array.from(new Set((assignees ?? []).map(a => a.user_id)))
  const { data: users, error: usersErr } = await supabase
    .from('users')
    .select('id, email')
    .in('id', userIds.length ? userIds : ['00000000-0000-0000-0000-000000000000'])

  if (usersErr) {
    console.error('Error fetching users for assignees', usersErr)
    return {}
  }

  const emailByUser: Record<string, string> = {}
  for (const u of users ?? []) {
    if (u && u.id && u.email) emailByUser[u.id] = u.email
  }

  const map: Record<string, string | null> = {}
  for (const deedId of deedIds) {
    const a = (assignees ?? []).find(x => x.deed_id === deedId)
    map[deedId] = a ? (emailByUser[a.user_id] ?? null) : null
  }

  return map
}

async function getFallbackOrgRecipient(org_id: string): Promise<string | null> {
  const { data, error } = await supabase
    .from('users')
    .select('email, role')
    .eq('org_id', org_id)
    .in('role', ['area_manager', 'partner'])
    .limit(1)

  if (error) {
    console.error('Error fetching fallback org recipient', error)
    return null
  }
  return data && data[0]?.email ? data[0].email : null
}

async function sendInternalEmail(to: string, subject: string, html: string) {
  const { error } = await supabase.functions.invoke('send-email', {
    body: { to, subject, html },
  })
  if (error) {
    console.error('Error invoking send-email function', error)
  }
}

async function createTask(org_id: string, title: string, description: string, due_date?: string, priority: 'low' | 'medium' | 'high' = 'medium') {
  const payload: any = { org_id, title, description, status: 'pending', priority }
  if (due_date) payload.due_date = due_date
  const { error } = await supabase.from('tasks').insert([payload])
  if (error) {
    console.error('Error creating reminder task', error)
  }
}

function buildSubject(type: ReminderType, days: number, deedTitle: string) {
  const label = type === 'modelo600' ? 'Modelo 600' : type === 'asiento' ? 'Asiento' : 'Calificación'
  return `Recordatorio T-${days} ${label} — ${deedTitle}`
}

function buildEmailHtml(type: ReminderType, days: number, deedTitle: string, deadlineISO: string) {
  const label = type === 'modelo600' ? 'Modelo 600' : type === 'asiento' ? 'Asiento' : 'Calificación'
  return `
    <h2>Recordatorio T-${days}: ${label}</h2>
    <p>Expediente: <strong>${deedTitle}</strong></p>
    <p>Fecha límite: <strong>${deadlineISO}</strong></p>
    <p>Este recordatorio se ha generado automáticamente.</p>
  `
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { org_id: orgFilter, dryRun }: ReqBody = await req.json().catch(() => ({}))

    const today = toDateOnly(new Date())
    const maxDate = addDays(today, 16) // cubre hasta T-15

    // Helper to fetch deeds for a deadline column
    async function fetchDeedsByDeadline(column: string) {
      let q = supabase
        .from('deeds')
        .select('id, org_id, title, model600_deadline, asiento_expiration_date, qualification_deadline')
        .gte(column, fmt(today))
        .lte(column, fmt(maxDate))
      if (orgFilter) q = q.eq('org_id', orgFilter)
      const { data, error } = await q
      if (error) throw error
      return data ?? []
    }

    const [m600Deeds, asientoDeeds, califDeeds] = await Promise.all([
      fetchDeedsByDeadline('model600_deadline'),
      fetchDeedsByDeadline('asiento_expiration_date'),
      fetchDeedsByDeadline('qualification_deadline'),
    ])

    const allDeeds = Array.from(new Set([...m600Deeds, ...asientoDeeds, ...califDeeds].map(d => d.id)))
    const recipientsByDeed = await getRecipientsByDeed(allDeeds)

    const results: any[] = []

    async function processDeed(d: any, type: ReminderType, deadlines: number[], deadlineField: string) {
      const deadlineVal = d[deadlineField]
      if (!deadlineVal) return
      const deadline = toDateOnly(deadlineVal)
      const days = diffDays(deadline, today)
      if (!deadlines.includes(days)) return

      // Upsert log to avoid duplicates
      const { inserted } = await upsertReminderLog(d.org_id, d.id, type, days)
      if (!inserted) {
        results.push({ deed_id: d.id, type, days, status: 'skipped_duplicate' })
        return
      }

      const subject = buildSubject(type, days, d.title)
      const html = buildEmailHtml(type, days, d.title, fmt(deadline))
      const priority = days <= 3 ? 'high' : 'medium'

      // Resolve recipient
      let recipient = recipientsByDeed[d.id] || null
      if (!recipient) recipient = await getFallbackOrgRecipient(d.org_id)

      if (!dryRun) {
        if (recipient) await sendInternalEmail(recipient, subject, html)
        await createTask(d.org_id, subject, `Generado automáticamente. Límite: ${fmt(deadline)}.`, fmt(deadline), priority as any)
      }

      results.push({ deed_id: d.id, type, days, status: 'processed', recipient: recipient ?? null })
    }

    // Procesar según reglas
    await Promise.all([
      ...m600Deeds.map(d => processDeed(d, 'modelo600', [10, 5, 1], 'model600_deadline')),
      ...asientoDeeds.map(d => processDeed(d, 'asiento', [15, 7, 3], 'asiento_expiration_date')),
      ...califDeeds.map(d => processDeed(d, 'calificacion', [10, 5, 1], 'qualification_deadline')),
    ])

    return new Response(
      JSON.stringify({ ok: true, count: results.length, results }),
      { headers: { "Content-Type": "application/json", ...corsHeaders } }
    )
  } catch (error) {
    console.error('deed-reminders error', error)
    return new Response(
      JSON.stringify({ ok: false, error: (error as any)?.message ?? 'Unknown error' }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    )
  }
})
