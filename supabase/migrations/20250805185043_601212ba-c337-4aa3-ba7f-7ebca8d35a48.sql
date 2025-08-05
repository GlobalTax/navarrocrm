-- Crear tabla subscription_user_assignments si no existe
CREATE TABLE IF NOT EXISTS public.subscription_user_assignments (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id uuid NOT NULL,
  subscription_id uuid NOT NULL,
  user_id uuid NOT NULL,
  assigned_date timestamp with time zone NOT NULL DEFAULT now(),
  status character varying NOT NULL DEFAULT 'active',
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.subscription_user_assignments ENABLE ROW LEVEL SECURITY;

-- Crear foreign key constraints
ALTER TABLE public.subscription_user_assignments 
ADD CONSTRAINT fk_subscription_user_assignments_org_id 
FOREIGN KEY (org_id) REFERENCES public.organizations(id) ON DELETE CASCADE;

ALTER TABLE public.subscription_user_assignments 
ADD CONSTRAINT fk_subscription_user_assignments_subscription_id 
FOREIGN KEY (subscription_id) REFERENCES public.outgoing_subscriptions(id) ON DELETE CASCADE;

ALTER TABLE public.subscription_user_assignments 
ADD CONSTRAINT fk_subscription_user_assignments_user_id 
FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

-- Crear políticas RLS
CREATE POLICY "Users can view assignments from their org" 
ON public.subscription_user_assignments 
FOR SELECT 
USING (org_id = get_user_org_id());

CREATE POLICY "Users can insert assignments in their org" 
ON public.subscription_user_assignments 
FOR INSERT 
WITH CHECK (org_id = get_user_org_id());

CREATE POLICY "Users can update assignments in their org" 
ON public.subscription_user_assignments 
FOR UPDATE 
USING (org_id = get_user_org_id());

CREATE POLICY "Users can delete assignments in their org" 
ON public.subscription_user_assignments 
FOR DELETE 
USING (org_id = get_user_org_id());

-- Crear trigger para updated_at
CREATE TRIGGER update_subscription_assignments_updated_at
BEFORE UPDATE ON public.subscription_user_assignments
FOR EACH ROW
EXECUTE FUNCTION public.update_subscription_assignments_updated_at();

-- Crear función de validación para asignaciones
CREATE OR REPLACE FUNCTION public.validate_subscription_assignment()
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
$$ LANGUAGE plpgsql SECURITY DEFINER;