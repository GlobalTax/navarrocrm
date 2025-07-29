-- Create subscription user assignments table for license management
CREATE TABLE public.subscription_user_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL,
  subscription_id UUID NOT NULL,
  user_id UUID NOT NULL,
  assigned_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.subscription_user_assignments ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view subscription assignments from their org"
ON public.subscription_user_assignments
FOR SELECT
USING (org_id = get_user_org_id());

CREATE POLICY "Users can create subscription assignments in their org"
ON public.subscription_user_assignments
FOR INSERT
WITH CHECK (org_id = get_user_org_id());

CREATE POLICY "Users can update subscription assignments in their org"
ON public.subscription_user_assignments
FOR UPDATE
USING (org_id = get_user_org_id());

CREATE POLICY "Users can delete subscription assignments in their org"
ON public.subscription_user_assignments
FOR DELETE
USING (org_id = get_user_org_id());

-- Create indexes for better performance
CREATE INDEX idx_subscription_user_assignments_subscription_id 
ON public.subscription_user_assignments(subscription_id);

CREATE INDEX idx_subscription_user_assignments_user_id 
ON public.subscription_user_assignments(user_id);

CREATE INDEX idx_subscription_user_assignments_org_id 
ON public.subscription_user_assignments(org_id);

-- Ensure we don't exceed the subscription quantity
CREATE OR REPLACE FUNCTION validate_subscription_assignment()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER validate_subscription_assignment_trigger
  BEFORE INSERT OR UPDATE ON public.subscription_user_assignments
  FOR EACH ROW
  EXECUTE FUNCTION validate_subscription_assignment();

-- Create function to update updated_at
CREATE OR REPLACE FUNCTION update_subscription_assignments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER update_subscription_assignments_updated_at_trigger
  BEFORE UPDATE ON public.subscription_user_assignments
  FOR EACH ROW
  EXECUTE FUNCTION update_subscription_assignments_updated_at();