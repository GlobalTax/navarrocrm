import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function formatPeriod(date = new Date()): string {
  const y = date.getUTCFullYear();
  const m = `${date.getUTCMonth() + 1}`.padStart(2, "0");
  return `${y}-${m}`;
}

function firstDateOfPeriod(period: string): Date {
  const [y, m] = period.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, 1));
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date.getTime());
  d.setUTCDate(d.getUTCDate() + days);
  return d;
}

function toISODate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function adjustToBusinessDay(target: Date): Date {
  // 0 = Sun, 6 = Sat
  const day = target.getUTCDay();
  if (day === 0) return addDays(target, 1); // Sunday -> Monday
  if (day === 6) return addDays(target, 2); // Saturday -> Monday
  return target;
}

function dateWithDay(period: string, dayOfMonth: number): Date {
  const base = firstDateOfPeriod(period);
  const y = base.getUTCFullYear();
  const m = base.getUTCMonth();
  const d = new Date(Date.UTC(y, m, Math.min(dayOfMonth, 28))); // safe cap, adjust below
  // Try set exact day, but JS auto-rollover; correct if overflowed by re-setting
  d.setUTCDate(dayOfMonth);
  return adjustToBusinessDay(d);
}

async function sleep(ms: number) {
  return new Promise((res) => setTimeout(res, ms));
}

async function withRetry<T>(fn: () => Promise<T>, retries = 3, baseDelay = 200): Promise<T> {
  let lastErr: any;
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      await sleep(baseDelay * Math.pow(2, i));
    }
  }
  throw lastErr;
}

const SERVICE_LABEL: Record<string, string> = {
  accounting: "Contabilidad",
  tax: "Fiscal",
  labor: "Laboral",
};

interface RunSummary {
  contract_id: string;
  period: string;
  tasks_created: number;
  tasks_ids: string[];
  errors: any[];
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
  const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    return new Response(JSON.stringify({ error: "Missing Supabase envs" }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });

  try {
    const body = (await req.json().catch(() => ({}))) as {
      period?: string; // 'YYYY-MM' | 'current'
      contract_id?: string;
      client_id?: string;
      action?: 'run' | 'skip';
    };

    const period = body.period && body.period !== 'current' ? body.period : formatPeriod();
    const { contract_id, client_id } = body;
    const action = body.action || 'run';

    // Fetch contracts to process
    let contractsQuery = supabase
      .from('recurring_service_contracts')
      .select('id, org_id, client_id, services, day_of_month, is_active, default_assignees, task_templates');

    if (contract_id) contractsQuery = contractsQuery.eq('id', contract_id);
    if (client_id) contractsQuery = contractsQuery.eq('client_id', client_id);

    contractsQuery = contractsQuery.eq('is_active', true);

    const { data: contracts, error: contractsErr } = await contractsQuery;
    if (contractsErr) throw contractsErr;

    if (!contracts || contracts.length === 0) {
      return new Response(JSON.stringify({ message: 'No hay contratos activos para procesar', period }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // Fetch client names in bulk for titles
    const clientIds = Array.from(new Set(contracts.map((c: any) => c.client_id)));
    const { data: clientsMapData, error: clientsErr } = await supabase
      .from('contacts')
      .select('id, name')
      .in('id', clientIds);
    if (clientsErr) throw clientsErr;
    const clientsMap = new Map<string, string>(
      (clientsMapData || []).map((c: any) => [c.id, c.name])
    );

    // Discover tasks table columns to support optional fields
    const { data: colsData } = await supabase
      .from('information_schema.columns' as any)
      .select('column_name')
      .eq('table_schema', 'public')
      .eq('table_name', 'tasks');
    const taskCols = new Set((colsData || []).map((r: any) => r.column_name));

    const summaries: RunSummary[] = [];

    for (const contract of contracts) {
      const runSummary: RunSummary = {
        contract_id: contract.id,
        period,
        tasks_created: 0,
        tasks_ids: [],
        errors: [],
      };

      // Skip if already run for this contract+period
      const { data: priorRuns, error: priorErr } = await supabase
        .from('recurring_task_runs')
        .select('id')
        .eq('contract_id', contract.id)
        .eq('period', period)
        .limit(1);
      if (priorErr) {
        runSummary.errors.push({ type: 'prior_check_error', error: priorErr.message });
        summaries.push(runSummary);
        continue;
      }
      if (priorRuns && priorRuns.length > 0) {
        // Already processed
        summaries.push(runSummary);
        continue;
      }

      if (action === 'skip') {
        // Registrar run sin crear tareas
        const { error: insErr } = await supabase.from('recurring_task_runs').insert({
          org_id: contract.org_id,
          contract_id: contract.id,
          period,
          run_status: 'success',
          tasks_created: 0,
          tasks_ids: [],
          errors: { skipped: true },
        });
        if (insErr) {
          runSummary.errors.push({ type: 'skip_insert_error', error: insErr.message });
        }
        summaries.push(runSummary);
        continue;
      }

      try {
        const day = Math.max(1, Math.min(31, contract.day_of_month || 1));
        const due = dateWithDay(period, day);
        const clientName = clientsMap.get(contract.client_id) || 'Cliente';

        const services = (contract.services || {}) as Record<string, boolean>;
        const templates = (contract.task_templates || {}) as Record<string, any>;
        const assignees = (contract.default_assignees || {}) as {
          user_ids?: string[];
          team_ids?: string[];
          department_id?: string;
        };

        for (const key of Object.keys(services)) {
          if (!services[key]) continue;
          const serviceLabel = SERVICE_LABEL[key] || key;
          const title = `${serviceLabel} mensual — ${clientName} — ${period}`;

          // Build base payload
          const baseTask: Record<string, any> = {
            org_id: contract.org_id,
            title,
          };
          if (taskCols.has('status')) baseTask.status = 'pending';
          if (taskCols.has('priority')) baseTask.priority = 'medium';
          if (taskCols.has('due_date')) baseTask.due_date = toISODate(due);
          if (taskCols.has('service_contract_id')) baseTask.service_contract_id = contract.id;
          if (taskCols.has('service_type')) baseTask.service_type = key;

          // Assignments (best-effort)
          const userId = assignees.user_ids?.[0];
          if (userId && taskCols.has('assigned_to')) baseTask.assigned_to = userId;
          const teamId = assignees.team_ids?.[0];
          if (teamId && taskCols.has('team_id')) baseTask.team_id = teamId;
          if (assignees.department_id && taskCols.has('department_id')) baseTask.department_id = assignees.department_id;

          // Create main task with retry
          const { data: mainTask, error: mainErr } = await withRetry(async () => {
            const { data, error } = await supabase
              .from('tasks')
              .insert(baseTask)
              .select('id')
              .single();
            if (error) throw error;
            return { data, error };
          });

          if (mainErr) {
            runSummary.errors.push({ type: 'create_task_error', service: key, error: mainErr.message });
            continue;
          }

          const mainTaskId = (mainTask as any)?.data?.id;
          if (mainTaskId) {
            runSummary.tasks_created += 1;
            runSummary.tasks_ids.push(mainTaskId);
          }

          // Subtasks by template offsets
          const serviceTpl = templates?.[key];
          const subtasks = serviceTpl?.subtasks as Array<{ title: string; due_offset_days?: number }> | undefined;
          if (Array.isArray(subtasks) && subtasks.length > 0) {
            for (const st of subtasks) {
              const stTitle = `${title} — ${st.title}`;
              const stDue = adjustToBusinessDay(addDays(due, st.due_offset_days || 0));
              const stPayload: Record<string, any> = {
                org_id: contract.org_id,
                title: stTitle,
              };
              if (taskCols.has('status')) stPayload.status = 'pending';
              if (taskCols.has('priority')) stPayload.priority = 'medium';
              if (taskCols.has('due_date')) stPayload.due_date = toISODate(stDue);
              if (taskCols.has('service_contract_id')) stPayload.service_contract_id = contract.id;
              if (taskCols.has('service_type')) stPayload.service_type = key;
              if (taskCols.has('parent_task_id') && mainTaskId) stPayload.parent_task_id = mainTaskId;

              if (userId && taskCols.has('assigned_to')) stPayload.assigned_to = userId;
              if (teamId && taskCols.has('team_id')) stPayload.team_id = teamId;
              if (assignees.department_id && taskCols.has('department_id')) stPayload.department_id = assignees.department_id;

              const { data: subTask, error: stErr } = await withRetry(async () => {
                const { data, error } = await supabase
                  .from('tasks')
                  .insert(stPayload)
                  .select('id')
                  .single();
                if (error) throw error;
                return { data, error };
              });

              if (stErr) {
                runSummary.errors.push({ type: 'create_subtask_error', service: key, title: st.title, error: stErr.message });
                continue;
              }

              const stId = (subTask as any)?.data?.id;
              if (stId) {
                runSummary.tasks_created += 1;
                runSummary.tasks_ids.push(stId);
              }
            }
          }
        }

        // Insert run summary
        const { error: runErr } = await supabase.from('recurring_task_runs').insert({
          org_id: contract.org_id,
          contract_id: contract.id,
          period,
          run_status: runSummary.errors.length === 0 ? 'success' : (runSummary.tasks_created > 0 ? 'partial' : 'error'),
          tasks_created: runSummary.tasks_created,
          tasks_ids: runSummary.tasks_ids,
          errors: runSummary.errors,
        });
        if (runErr) {
          runSummary.errors.push({ type: 'insert_run_error', error: runErr.message });
        }
      } catch (err: any) {
        runSummary.errors.push({ type: 'contract_processing_error', error: err?.message || String(err) });
      }

      summaries.push(runSummary);
    }

    return new Response(JSON.stringify({ period, summaries }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  } catch (error: any) {
    console.error('generate-recurring-tasks error', error);
    return new Response(JSON.stringify({ error: error?.message || 'Unknown error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
});
