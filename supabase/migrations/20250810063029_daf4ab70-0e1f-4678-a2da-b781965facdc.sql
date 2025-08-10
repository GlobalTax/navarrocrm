-- Fix missing RLS, indexes and constraint detected by validate_rls_setup

-- 1) service_hours_allocations RLS
ALTER TABLE IF EXISTS public.service_hours_allocations ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='service_hours_allocations' AND policyname='Users can view org allocations'
  ) THEN
    CREATE POLICY "Users can view org allocations"
    ON public.service_hours_allocations
    FOR SELECT
    USING (org_id = get_user_org_id());
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='service_hours_allocations' AND policyname='Partners/managers manage allocations'
  ) THEN
    CREATE POLICY "Partners/managers manage allocations"
    ON public.service_hours_allocations
    FOR ALL
    USING (
      org_id = get_user_org_id() AND EXISTS (
        SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role IN ('partner','area_manager')
      )
    )
    WITH CHECK (
      org_id = get_user_org_id() AND EXISTS (
        SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role IN ('partner','area_manager')
      )
    );
  END IF;
END$$;

-- 2) recurring_service_contracts RLS
ALTER TABLE IF EXISTS public.recurring_service_contracts ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='recurring_service_contracts' AND policyname='Users can view org contracts'
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
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='recurring_service_contracts' AND policyname='Partners/managers manage contracts'
  ) THEN
    CREATE POLICY "Partners/managers manage contracts"
    ON public.recurring_service_contracts
    FOR ALL
    USING (
      org_id = get_user_org_id() AND EXISTS (
        SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role IN ('partner','area_manager')
      )
    )
    WITH CHECK (
      org_id = get_user_org_id() AND EXISTS (
        SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role IN ('partner','area_manager')
      )
    );
  END IF;
END$$;

-- 3) Constraint for day_of_month
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname='recurring_contracts_day_of_month_range'
  ) THEN
    ALTER TABLE public.recurring_service_contracts 
      ADD CONSTRAINT recurring_contracts_day_of_month_range CHECK (day_of_month BETWEEN 1 AND 28);
  END IF;
END$$;

-- 4) Indexes on time_entries
CREATE INDEX IF NOT EXISTS idx_time_entries_contract ON public.time_entries (service_contract_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_service_type ON public.time_entries (service_type);
