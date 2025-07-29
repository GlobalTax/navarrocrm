-- Fix function search path security warnings
DROP FUNCTION IF EXISTS validate_subscription_assignment();
DROP FUNCTION IF EXISTS update_subscription_assignments_updated_at();

-- Recreate functions with secure search path
CREATE OR REPLACE FUNCTION validate_subscription_assignment()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  sub_quantity INTEGER;
  current_assignments INTEGER;
BEGIN
  -- Get subscription quantity
  SELECT quantity INTO sub_quantity
  FROM public.outgoing_subscriptions
  WHERE id = NEW.subscription_id;
  
  -- Count current active assignments
  SELECT COUNT(*) INTO current_assignments
  FROM public.subscription_user_assignments
  WHERE subscription_id = NEW.subscription_id 
  AND status = 'active'
  AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid);
  
  -- Check if we're exceeding the limit (only for active assignments)
  IF NEW.status = 'active' AND current_assignments >= sub_quantity THEN
    RAISE EXCEPTION 'Cannot assign more users than available licenses. Available: %, Currently assigned: %', 
      sub_quantity, current_assignments;
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION update_subscription_assignments_updated_at()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;