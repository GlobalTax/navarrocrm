-- Recrear tabla subscription_user_assignments completamente
DROP TABLE IF EXISTS public.subscription_user_assignments CASCADE;

-- Crear tabla subscription_user_assignments con estructura correcta
CREATE TABLE public.subscription_user_assignments (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    subscription_id UUID NOT NULL REFERENCES public.outgoing_subscriptions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    assigned_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    status CHARACTER VARYING NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Crear índices para optimizar consultas
CREATE INDEX idx_subscription_user_assignments_org_id ON public.subscription_user_assignments(org_id);
CREATE INDEX idx_subscription_user_assignments_subscription_id ON public.subscription_user_assignments(subscription_id);
CREATE INDEX idx_subscription_user_assignments_user_id ON public.subscription_user_assignments(user_id);
CREATE INDEX idx_subscription_user_assignments_status ON public.subscription_user_assignments(status);

-- Crear constraint único para evitar asignaciones duplicadas
CREATE UNIQUE INDEX idx_subscription_user_assignments_unique 
ON public.subscription_user_assignments(subscription_id, user_id) 
WHERE status = 'active';

-- Habilitar RLS
ALTER TABLE public.subscription_user_assignments ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Users can view assignments from their org" ON public.subscription_user_assignments
    FOR SELECT USING (org_id = get_user_org_id());

CREATE POLICY "Users can create assignments in their org" ON public.subscription_user_assignments
    FOR INSERT WITH CHECK (org_id = get_user_org_id());

CREATE POLICY "Users can update assignments in their org" ON public.subscription_user_assignments
    FOR UPDATE USING (org_id = get_user_org_id());

CREATE POLICY "Users can delete assignments in their org" ON public.subscription_user_assignments
    FOR DELETE USING (org_id = get_user_org_id());

-- Trigger para actualizar updated_at
CREATE TRIGGER update_subscription_assignments_updated_at
    BEFORE UPDATE ON public.subscription_user_assignments
    FOR EACH ROW
    EXECUTE FUNCTION public.update_subscription_assignments_updated_at();

-- Trigger para validar asignaciones
CREATE TRIGGER validate_subscription_assignment
    BEFORE INSERT OR UPDATE ON public.subscription_user_assignments
    FOR EACH ROW
    EXECUTE FUNCTION public.validate_subscription_assignment();