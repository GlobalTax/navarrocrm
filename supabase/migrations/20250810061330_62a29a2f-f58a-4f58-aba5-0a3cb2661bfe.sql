-- P1 Migrations: allocations table, link time_entries, RLS, validations, RPC for monthly report

-- 0) Enum for service types (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'service_type') THEN
    CREATE TYPE public.service_type AS ENUM ('accounting','tax','labor');
  END IF;
END$$;

-- 1) Create service_hours_allocations
CREATE TABLE IF NOT EXISTS public.service_hours_allocations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL,
  service_contract_id uuid NOT NULL,
  service_type public.service_type NOT NULL,
  month text NOT NULL, -- format YYYY-MM
  allocated_hours numeric NOT NULL DEFAULT 0,
  notes text,
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes
CREATE UNIQUE INDEX IF NOT EXISTS uq_allocations_unique 
  ON public.service_hours_allocations (org_id, service_contract_id, service_type, month);
CREATE INDEX IF NOT EXISTS idx_allocations_month ON public.service_hours_allocations (month);
CREATE INDEX IF NOT EXISTS idx_allocations_contract ON public.service_hours_allocations (service_contract_id);

-- RLS
ALTER TABLE public.service_hours_allocations ENABLE ROW LEVEL SECURITY;

-- View policy
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'service_hours_allocations' AND policyname = 'Users can view org allocations'
  ) THEN
    CREATE POLICY "Users can view org allocations"
      ON public.service_hours_allocations
      FOR SELECT
      USING (org_id = get_user_org_id());
  END IF;
END$$;

-- Insert/update only by partners/managers
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'service_hours_allocations' AND policyname = 'Partners/managers manage allocations'
  ) THEN
    CREATE POLICY "Partners/managers manage allocations"
      ON public.service_hours_allocations
      FOR ALL
      USING (
        org_id = get_user_org_id() AND EXISTS (
          SELECT 1 FROM public.users u 
          WHERE u.id = auth.uid() AND u.role IN ('partner','area_manager')
        )
      )
      WITH CHECK (
        org_id = get_user_org_id() AND EXISTS (
          SELECT 1 FROM public.users u 
          WHERE u.id = auth.uid() AND u.role IN ('partner','area_manager')
        )
      );
  END IF;
END$$;

-- 2) Link time_entries to contracts and service type
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'time_entries' AND column_name = 'service_contract_id'
  ) THEN
    ALTER TABLE public.time_entries ADD COLUMN service_contract_id uuid;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'time_entries' AND column_name = 'service_type'
  ) THEN
    ALTER TABLE public.time_entries ADD COLUMN service_type public.service_type;
  END IF;
END$$;

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_time_entries_contract ON public.time_entries (service_contract_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_service_type ON public.time_entries (service_type);

-- 3) RLS/UI limits for recurring_service_contracts
-- Allow only partners/managers to insert/update/delete; everyone in org can select
ALTER TABLE public.recurring_service_contracts ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'recurring_service_contracts' AND policyname = 'Users can view org contracts'
  ) THEN
    CREATE POLICY "Users can view org contracts"
      ON public.recurring_service_contracts
      FOR SELECT
      USING (org_id = get_user_org_id());
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'recurring_service_contracts' AND policyname = 'Partners/managers manage contracts'
  ) THEN
    CREATE POLICY "Partners/managers manage contracts"
      ON public.recurring_service_contracts
      FOR ALL
      USING (
        org_id = get_user_org_id() AND EXISTS (
          SELECT 1 FROM public.users u 
          WHERE u.id = auth.uid() AND u.role IN ('partner','area_manager')
        )
      )
      WITH CHECK (
        org_id = get_user_org_id() AND EXISTS (
          SELECT 1 FROM public.users u 
          WHERE u.id = auth.uid() AND u.role IN ('partner','area_manager')
        )
      );
  END IF;
END$$;

-- 4) Validate day_of_month within [1..28]
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'recurring_contracts_day_of_month_range'
  ) THEN
    ALTER TABLE public.recurring_service_contracts 
      ADD CONSTRAINT recurring_contracts_day_of_month_range CHECK (day_of_month BETWEEN 1 AND 28);
  END IF;
END$$;

-- 5) RPC: monthly service hours report
CREATE OR REPLACE FUNCTION public.get_monthly_service_hours(org_uuid uuid, period text)
RETURNS TABLE (
  service_contract_id uuid,
  contact_id uuid,
  client_name text,
  service_type public.service_type,
  allocated_hours numeric,
  actual_hours numeric,
  delta_hours numeric
) AS $$
BEGIN
  RETURN QUERY
  WITH alloc AS (
    SELECT 
      a.service_contract_id,
      c.contact_id,
      a.service_type,
      SUM(a.allocated_hours) AS allocated_hours
    FROM public.service_hours_allocations a
    JOIN public.recurring_service_contracts c ON c.id = a.service_contract_id
    WHERE a.org_id = org_uuid AND a.month = period
    GROUP BY a.service_contract_id, c.contact_id, a.service_type
  ),
  actual AS (
    SELECT 
      te.service_contract_id,
      rsc.contact_id,
      te.service_type,
      COALESCE(SUM(te.duration_minutes) / 60.0, 0) AS actual_hours
    FROM public.time_entries te
    JOIN public.recurring_service_contracts rsc ON rsc.id = te.service_contract_id
    WHERE te.service_contract_id IS NOT NULL
      AND te.org_id = org_uuid
      AND to_char(te.created_at, 'YYYY-MM') = period
    GROUP BY te.service_contract_id, rsc.contact_id, te.service_type
  )
  SELECT 
    COALESCE(a.service_contract_id, ac.service_contract_id) AS service_contract_id,
    COALESCE(a.contact_id, ac.contact_id) AS contact_id,
    (SELECT name FROM public.contacts ct WHERE ct.id = COALESCE(a.contact_id, ac.contact_id) LIMIT 1) AS client_name,
    COALESCE(a.service_type, ac.service_type) AS service_type,
    COALESCE(a.allocated_hours, 0) AS allocated_hours,
    COALESCE(ac.actual_hours, 0) AS actual_hours,
    COALESCE(ac.actual_hours, 0) - COALESCE(a.allocated_hours, 0) AS delta_hours
  FROM alloc a
  FULL OUTER JOIN actual ac 
    ON ac.service_contract_id = a.service_contract_id
   AND ac.service_type = a.service_type;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- 6) Optional seed: create one demo contract if possible
DO $$
DECLARE
  v_org uuid;
  v_contact uuid;
  v_contract uuid;
BEGIN
  SELECT id INTO v_org FROM public.organizations LIMIT 1;
  IF v_org IS NULL THEN RETURN; END IF;
  SELECT id INTO v_contact FROM public.contacts WHERE org_id = v_org LIMIT 1;
  IF v_contact IS NULL THEN RETURN; END IF;

  -- Create a demo recurring contract if none exists
  IF NOT EXISTS (SELECT 1 FROM public.recurring_service_contracts WHERE org_id = v_org) THEN
    INSERT INTO public.recurring_service_contracts (
      org_id, contact_id, name, description, amount, frequency, start_date, billing_day, included_hours, hourly_rate_extra, auto_invoice, auto_send_notifications, payment_terms, priority, status, created_by, sla_config, day_of_month
    ) VALUES (
      v_org, v_contact, 'Contrato recurrente demo', 'Demo', 500, 'monthly', CURRENT_DATE, 5, 10, 60, true, true, 30, 'medium', 'active', (SELECT id FROM public.users WHERE org_id = v_org LIMIT 1), '{"accounting":8,"tax":6,"labor":4}', 10
    ) RETURNING id INTO v_contract;

    -- Seed allocations for current month
    INSERT INTO public.service_hours_allocations (org_id, service_contract_id, service_type, month, allocated_hours, created_by)
    VALUES 
      (v_org, v_contract, 'accounting', to_char(CURRENT_DATE, 'YYYY-MM'), 8, (SELECT id FROM public.users WHERE org_id = v_org LIMIT 1)),
      (v_org, v_contract, 'tax', to_char(CURRENT_DATE, 'YYYY-MM'), 6, (SELECT id FROM public.users WHERE org_id = v_org LIMIT 1)),
      (v_org, v_contract, 'labor', to_char(CURRENT_DATE, 'YYYY-MM'), 4, (SELECT id FROM public.users WHERE org_id = v_org LIMIT 1));
  END IF;
END$$;