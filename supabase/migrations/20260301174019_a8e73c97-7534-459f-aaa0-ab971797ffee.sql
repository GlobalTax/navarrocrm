
-- 1. Drop existing triggers (both possible names)
DROP TRIGGER IF EXISTS proposal_audit_trigger ON public.proposals;
DROP TRIGGER IF EXISTS log_proposal_changes ON public.proposals;

-- 2. Harden the function: early return on DELETE
CREATE OR REPLACE FUNCTION public.log_proposal_changes()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
  action_type_val TEXT;
  old_values JSONB;
  new_values JSONB;
  user_id_val UUID;
BEGIN
  -- Skip DELETE operations to avoid FK violation
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;

  -- Determine action type
  IF TG_OP = 'INSERT' THEN
    action_type_val := 'created';
    old_values := NULL;
    new_values := row_to_json(NEW)::jsonb;
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.status != NEW.status THEN
      action_type_val := 'status_changed';
    ELSIF OLD.total_amount != NEW.total_amount THEN
      action_type_val := 'amount_changed';
    ELSIF OLD.sent_at IS NULL AND NEW.sent_at IS NOT NULL THEN
      action_type_val := 'sent';
    ELSIF OLD.accepted_at IS NULL AND NEW.accepted_at IS NOT NULL THEN
      action_type_val := 'accepted';
    ELSE
      action_type_val := 'updated';
    END IF;
    old_values := row_to_json(OLD)::jsonb;
    new_values := row_to_json(NEW)::jsonb;
  END IF;

  user_id_val := auth.uid();

  INSERT INTO public.proposal_audit_log (
    proposal_id, org_id, user_id, action_type, old_value, new_value
  ) VALUES (
    NEW.id, NEW.org_id, user_id_val, action_type_val, old_values, new_values
  );

  RETURN NEW;
END;
$function$;

-- 3. Recreate trigger ONLY for INSERT and UPDATE
CREATE TRIGGER proposal_audit_trigger
  AFTER INSERT OR UPDATE ON public.proposals
  FOR EACH ROW EXECUTE FUNCTION public.log_proposal_changes();
