-- Crear tabla subscription_user_assignments con todas las foreign keys
CREATE TABLE IF NOT EXISTS public.subscription_user_assignments (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  subscription_id uuid NOT NULL REFERENCES public.outgoing_subscriptions(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  assigned_date timestamp with time zone NOT NULL DEFAULT now(),
  status character varying NOT NULL DEFAULT 'active'::character varying,
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT subscription_user_assignments_status_check CHECK (status IN ('active', 'inactive'))
);

-- Habilitar RLS
ALTER TABLE public.subscription_user_assignments ENABLE ROW LEVEL SECURITY;

-- Crear políticas RLS
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

-- Crear trigger para updated_at
CREATE TRIGGER update_subscription_assignments_updated_at
  BEFORE UPDATE ON public.subscription_user_assignments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_subscription_assignments_updated_at();

-- Crear trigger de validación
CREATE TRIGGER validate_subscription_assignment_trigger
  BEFORE INSERT OR UPDATE ON public.subscription_user_assignments
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_subscription_assignment();