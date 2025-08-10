-- Create helper to validate RLS and indexes
CREATE OR REPLACE FUNCTION public.validate_rls_setup()
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  result jsonb := '{}'::jsonb;
  has_alloc_view boolean;
  has_alloc_manage boolean;
  has_contract_view boolean;
  has_contract_manage boolean;
  has_day_check boolean;
  has_idx_te_contract boolean;
  has_idx_te_service boolean;
  has_alloc_table boolean;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='service_hours_allocations' AND policyname='Users can view org allocations'
  ) INTO has_alloc_view;

  SELECT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='service_hours_allocations' AND policyname='Partners/managers manage allocations'
  ) INTO has_alloc_manage;

  SELECT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='recurring_service_contracts' AND policyname='Users can view org contracts'
  ) INTO has_contract_view;

  SELECT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='recurring_service_contracts' AND policyname='Partners/managers manage contracts'
  ) INTO has_contract_manage;

  SELECT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname='recurring_contracts_day_of_month_range'
  ) INTO has_day_check;

  SELECT EXISTS (
    SELECT 1 FROM pg_class WHERE relname='idx_time_entries_contract'
  ) INTO has_idx_te_contract;

  SELECT EXISTS (
    SELECT 1 FROM pg_class WHERE relname='idx_time_entries_service_type'
  ) INTO has_idx_te_service;

  SELECT EXISTS (
    SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='service_hours_allocations'
  ) INTO has_alloc_table;

  result := jsonb_build_object(
    'service_hours_allocations_table', has_alloc_table,
    'policy_alloc_view', has_alloc_view,
    'policy_alloc_manage', has_alloc_manage,
    'policy_contract_view', has_contract_view,
    'policy_contract_manage', has_contract_manage,
    'check_day_of_month', has_day_check,
    'index_te_contract', has_idx_te_contract,
    'index_te_service', has_idx_te_service,
    'checked_at', now()
  );

  RETURN result;
END;
$$;