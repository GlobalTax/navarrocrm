
-- Habilitar Row Level Security en las tablas que lo necesitan
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_entries ENABLE ROW LEVEL SECURITY;

-- Crear función de utilidad para obtener la organización del usuario actual
CREATE OR REPLACE FUNCTION public.get_user_org_id()
RETURNS uuid AS $$
BEGIN
  RETURN (SELECT org_id FROM public.users WHERE id = auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Políticas RLS para clients
CREATE POLICY "Users can view clients from their org" 
  ON public.clients 
  FOR SELECT 
  USING (org_id = public.get_user_org_id());

CREATE POLICY "Users can insert clients in their org" 
  ON public.clients 
  FOR INSERT 
  WITH CHECK (org_id = public.get_user_org_id());

CREATE POLICY "Users can update clients in their org" 
  ON public.clients 
  FOR UPDATE 
  USING (org_id = public.get_user_org_id());

CREATE POLICY "Users can delete clients in their org" 
  ON public.clients 
  FOR DELETE 
  USING (org_id = public.get_user_org_id());

-- Políticas RLS para cases
CREATE POLICY "Users can view cases from their org" 
  ON public.cases 
  FOR SELECT 
  USING (org_id = public.get_user_org_id());

CREATE POLICY "Users can insert cases in their org" 
  ON public.cases 
  FOR INSERT 
  WITH CHECK (org_id = public.get_user_org_id());

CREATE POLICY "Users can update cases in their org" 
  ON public.cases 
  FOR UPDATE 
  USING (org_id = public.get_user_org_id());

CREATE POLICY "Users can delete cases in their org" 
  ON public.cases 
  FOR DELETE 
  USING (org_id = public.get_user_org_id());

-- Políticas RLS para time_entries
CREATE POLICY "Users can view time entries from their org" 
  ON public.time_entries 
  FOR SELECT 
  USING (org_id = public.get_user_org_id());

CREATE POLICY "Users can insert time entries in their org" 
  ON public.time_entries 
  FOR INSERT 
  WITH CHECK (org_id = public.get_user_org_id());

CREATE POLICY "Users can update time entries in their org" 
  ON public.time_entries 
  FOR UPDATE 
  USING (org_id = public.get_user_org_id());

CREATE POLICY "Users can delete time entries in their org" 
  ON public.time_entries 
  FOR DELETE 
  USING (org_id = public.get_user_org_id());
