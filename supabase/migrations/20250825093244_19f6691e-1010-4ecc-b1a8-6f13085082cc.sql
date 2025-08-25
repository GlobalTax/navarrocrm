-- Fix Security Definer functions that don't need elevated privileges

-- 1. Fix add_business_days - Pure utility function, doesn't need SECURITY DEFINER
CREATE OR REPLACE FUNCTION public.add_business_days(start_date date, days integer)
 RETURNS date
 LANGUAGE plpgsql
 STABLE  -- Changed from SECURITY DEFINER to STABLE
 SET search_path TO ''
AS $function$
declare
  d date := start_date;
  i integer := 0;
begin
  if start_date is null or days is null then
    return null;
  end if;
  while i < days loop
    d := d + interval '1 day';
    -- 0 = domingo, 6 = sábado
    if extract(dow from d) not in (0, 6) then
      i := i + 1;
    end if;
  end loop;
  return d::date;
end;
$function$;

-- 2. Fix calculation functions that don't need SECURITY DEFINER
-- These functions only operate on data within the specified org_id, so they don't need to bypass RLS
CREATE OR REPLACE FUNCTION public.calculate_next_billing_date(input_date date, frequency character varying, billing_day integer DEFAULT 1)
 RETURNS date
 LANGUAGE plpgsql
 STABLE  -- Changed from SECURITY DEFINER to STABLE
 SET search_path TO ''
AS $function$
DECLARE
  next_date DATE;
BEGIN
  CASE frequency
    WHEN 'monthly' THEN
      next_date := date_trunc('month', input_date) + INTERVAL '1 month' + (billing_day - 1) * INTERVAL '1 day';
    WHEN 'quarterly' THEN
      next_date := date_trunc('quarter', input_date) + INTERVAL '3 months' + (billing_day - 1) * INTERVAL '1 day';
    WHEN 'yearly' THEN
      next_date := date_trunc('year', input_date) + INTERVAL '1 year' + (billing_day - 1) * INTERVAL '1 day';
    ELSE
      next_date := input_date + INTERVAL '1 month';
  END CASE;
  
  RETURN next_date;
END;
$function$;

-- 3. Keep SECURITY DEFINER for functions that legitimately need it
-- (No changes to functions like get_user_org_id, is_super_admin, etc. as they need elevated privileges)

-- 4. Add comment documentation for remaining SECURITY DEFINER functions
COMMENT ON FUNCTION public.get_user_org_id() IS 'SECURITY DEFINER required: needs to bypass RLS to get user org_id from users table';
COMMENT ON FUNCTION public.is_super_admin(uuid) IS 'SECURITY DEFINER required: needs to bypass RLS to check user_roles table';
COMMENT ON FUNCTION public.log_security_event(text, jsonb) IS 'SECURITY DEFINER required: system logging function needs to bypass RLS';