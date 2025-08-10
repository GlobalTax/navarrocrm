-- P0 • Modelo de datos y RLS: contratos, ejecuciones y planificación de horas

-- 1) Tabla: recurring_service_contracts
CREATE TABLE IF NOT EXISTS public.recurring_service_contracts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL,
  client_id uuid NOT NULL,
  services jsonb NOT NULL DEFAULT '{}'::jsonb, -- flags: accounting, tax, labor
  frequency text NOT NULL DEFAULT 'monthly',
  day_of_month integer NOT NULL DEFAULT 1,
  start_date date NOT NULL,
  end_date date NULL,
  is_active boolean NOT NULL DEFAULT true,
  default_assignees jsonb NOT NULL DEFAULT '{}'::jsonb, -- { user_ids: uuid[], team_ids: uuid[], department_id: uuid }
  default_budget_hours jsonb NOT NULL DEFAULT '{}'::jsonb, -- por servicio
  task_templates jsonb NOT NULL DEFAULT '{}'::jsonb, -- por servicio
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT recurring_service_contracts_unique_active UNIQUE (org_id, client_id, is_active),
  CONSTRAINT recurring_service_contracts_frequency_chk CHECK (frequency = 'monthly')
);

-- RLS
ALTER TABLE public.recurring_service_contracts ENABLE ROW LEVEL SECURITY;

-- SELECT para toda la organización
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'recurring_service_contracts' AND policyname = 'Users can view recurring_service_contracts from their org'
  ) THEN
    CREATE POLICY "Users can view recurring_service_contracts from their org"
    ON public.recurring_service_contracts
    FOR SELECT
    USING (org_id = public.get_user_org_id());
  END IF;
END$$;

-- INSERT solo partner/area_manager
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'recurring_service_contracts' AND policyname = 'Partners/managers can insert recurring_service_contracts'
  ) THEN
    CREATE POLICY "Partners/managers can insert recurring_service_contracts"
    ON public.recurring_service_contracts
    FOR INSERT
    WITH CHECK (
      org_id = public.get_user_org_id() AND EXISTS (
        SELECT 1 FROM public.users u
        WHERE u.id = auth.uid() AND (u.role)::text IN ('partner','area_manager')
      )
    );
  END IF;
END$$;

-- UPDATE solo partner/area_manager
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'recurring_service_contracts' AND policyname = 'Partners/managers can update recurring_service_contracts'
  ) THEN
    CREATE POLICY "Partners/managers can update recurring_service_contracts"
    ON public.recurring_service_contracts
    FOR UPDATE
    USING (
      org_id = public.get_user_org_id() AND EXISTS (
        SELECT 1 FROM public.users u
        WHERE u.id = auth.uid() AND (u.role)::text IN ('partner','area_manager')
      )
    )
    WITH CHECK (
      org_id = public.get_user_org_id() AND EXISTS (
        SELECT 1 FROM public.users u
        WHERE u.id = auth.uid() AND (u.role)::text IN ('partner','area_manager')
      )
    );
  END IF;
END$$;

-- DELETE solo partner/area_manager
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'recurring_service_contracts' AND policyname = 'Partners/managers can delete recurring_service_contracts'
  ) THEN
    CREATE POLICY "Partners/managers can delete recurring_service_contracts"
    ON public.recurring_service_contracts
    FOR DELETE
    USING (
      org_id = public.get_user_org_id() AND EXISTS (
        SELECT 1 FROM public.users u
        WHERE u.id = auth.uid() AND (u.role)::text IN ('partner','area_manager')
      )
    );
  END IF;
END$$;

-- Trigger updated_at
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_update_recurring_service_contracts_updated_at'
  ) THEN
    CREATE TRIGGER trg_update_recurring_service_contracts_updated_at
    BEFORE UPDATE ON public.recurring_service_contracts
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END$$;


-- 2) Tabla: recurring_task_runs
CREATE TABLE IF NOT EXISTS public.recurring_task_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL,
  contract_id uuid NOT NULL,
  period text NOT NULL, -- 'YYYY-MM'
  run_status text NOT NULL CHECK (run_status IN ('success','partial','error')),
  tasks_created integer NOT NULL DEFAULT 0,
  tasks_ids uuid[] NOT NULL DEFAULT '{}'::uuid[],
  errors jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Índices solicitados
CREATE INDEX IF NOT EXISTS idx_recurring_task_runs_org_period ON public.recurring_task_runs (org_id, period);
CREATE INDEX IF NOT EXISTS idx_recurring_task_runs_contract_period ON public.recurring_task_runs (contract_id, period);

-- RLS por org_id (lectura/escritura dentro de la org)
ALTER TABLE public.recurring_task_runs ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'recurring_task_runs' AND policyname = 'Users can view recurring_task_runs from their org'
  ) THEN
    CREATE POLICY "Users can view recurring_task_runs from their org"
    ON public.recurring_task_runs
    FOR SELECT
    USING (org_id = public.get_user_org_id());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'recurring_task_runs' AND policyname = 'Users can insert recurring_task_runs in their org'
  ) THEN
    CREATE POLICY "Users can insert recurring_task_runs in their org"
    ON public.recurring_task_runs
    FOR INSERT
    WITH CHECK (org_id = public.get_user_org_id());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'recurring_task_runs' AND policyname = 'Users can update recurring_task_runs in their org'
  ) THEN
    CREATE POLICY "Users can update recurring_task_runs in their org"
    ON public.recurring_task_runs
    FOR UPDATE
    USING (org_id = public.get_user_org_id())
    WITH CHECK (org_id = public.get_user_org_id());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'recurring_task_runs' AND policyname = 'Users can delete recurring_task_runs in their org'
  ) THEN
    CREATE POLICY "Users can delete recurring_task_runs in their org"
    ON public.recurring_task_runs
    FOR DELETE
    USING (org_id = public.get_user_org_id());
  END IF;
END$$;


-- 3) Tabla: service_hours_allocations
CREATE TABLE IF NOT EXISTS public.service_hours_allocations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL,
  contract_id uuid NOT NULL,
  period text NOT NULL, -- 'YYYY-MM'
  target_type text NOT NULL CHECK (target_type IN ('user','team','department')),
  target_id uuid NOT NULL,
  planned_hours numeric NOT NULL DEFAULT 0,
  notes text NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT service_hours_allocations_unique UNIQUE (org_id, contract_id, period, target_type, target_id)
);

ALTER TABLE public.service_hours_allocations ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'service_hours_allocations' AND policyname = 'Users can view service_hours_allocations from their org'
  ) THEN
    CREATE POLICY "Users can view service_hours_allocations from their org"
    ON public.service_hours_allocations
    FOR SELECT
    USING (org_id = public.get_user_org_id());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'service_hours_allocations' AND policyname = 'Users can insert service_hours_allocations in their org'
  ) THEN
    CREATE POLICY "Users can insert service_hours_allocations in their org"
    ON public.service_hours_allocations
    FOR INSERT
    WITH CHECK (org_id = public.get_user_org_id());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'service_hours_allocations' AND policyname = 'Users can update service_hours_allocations in their org'
  ) THEN
    CREATE POLICY "Users can update service_hours_allocations in their org"
    ON public.service_hours_allocations
    FOR UPDATE
    USING (org_id = public.get_user_org_id())
    WITH CHECK (org_id = public.get_user_org_id());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'service_hours_allocations' AND policyname = 'Users can delete service_hours_allocations in their org'
  ) THEN
    CREATE POLICY "Users can delete service_hours_allocations in their org"
    ON public.service_hours_allocations
    FOR DELETE
    USING (org_id = public.get_user_org_id());
  END IF;
END$$;

-- Trigger updated_at
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_update_service_hours_allocations_updated_at'
  ) THEN
    CREATE TRIGGER trg_update_service_hours_allocations_updated_at
    BEFORE UPDATE ON public.service_hours_allocations
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END$$;


-- 4) Alteraciones en time_entries: columnas opcionales e índice
ALTER TABLE public.time_entries
  ADD COLUMN IF NOT EXISTS service_contract_id uuid NULL,
  ADD COLUMN IF NOT EXISTS service_type text NULL;

-- Check de valores permitidos para service_type (o NULL)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'time_entries_service_type_chk'
  ) THEN
    ALTER TABLE public.time_entries
    ADD CONSTRAINT time_entries_service_type_chk 
    CHECK (service_type IN ('accounting','tax','labor') OR service_type IS NULL);
  END IF;
END$$;

-- Índice combinado como se solicita
CREATE INDEX IF NOT EXISTS idx_time_entries_org_service_contract 
  ON public.time_entries (org_id, service_contract_id);
