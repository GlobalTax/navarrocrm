
-- Habilitar RLS en la tabla time_entries
ALTER TABLE public.time_entries ENABLE ROW LEVEL SECURITY;

-- Política para que los usuarios puedan ver sus propios registros de tiempo dentro de su organización
CREATE POLICY "Users can view own time entries in org" 
  ON public.time_entries 
  FOR SELECT 
  USING (org_id = (SELECT org_id FROM public.users WHERE id = auth.uid()) AND user_id = auth.uid());

-- Política para que los usuarios puedan crear sus propios registros de tiempo
CREATE POLICY "Users can create own time entries" 
  ON public.time_entries 
  FOR INSERT 
  WITH CHECK (org_id = (SELECT org_id FROM public.users WHERE id = auth.uid()) AND user_id = auth.uid());

-- Política para que los usuarios puedan actualizar sus propios registros de tiempo
CREATE POLICY "Users can update own time entries" 
  ON public.time_entries 
  FOR UPDATE 
  USING (org_id = (SELECT org_id FROM public.users WHERE id = auth.uid()) AND user_id = auth.uid());

-- Política para que los usuarios puedan eliminar sus propios registros de tiempo
CREATE POLICY "Users can delete own time entries" 
  ON public.time_entries 
  FOR DELETE 
  USING (org_id = (SELECT org_id FROM public.users WHERE id = auth.uid()) AND user_id = auth.uid());

-- Partners y Area Managers pueden ver todos los time entries de su organización
CREATE POLICY "Partners and managers can view all org time entries" 
  ON public.time_entries 
  FOR SELECT 
  USING (
    org_id = (SELECT org_id FROM public.users WHERE id = auth.uid()) 
    AND EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND role IN ('partner', 'area_manager')
    )
  );
