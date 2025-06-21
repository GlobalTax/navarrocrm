
-- Habilitar RLS en las tablas client_notes y client_documents
ALTER TABLE public.client_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_documents ENABLE ROW LEVEL SECURITY;

-- ========================================
-- POLÍTICAS PARA client_notes
-- ========================================

-- Política para que los usuarios puedan ver notas de clientes de su organización
-- Las notas privadas solo las puede ver quien las creó
CREATE POLICY "Users can view client notes from their org" 
  ON public.client_notes 
  FOR SELECT 
  USING (
    org_id = (SELECT org_id FROM public.users WHERE id = auth.uid()) 
    AND (
      is_private = false 
      OR user_id = auth.uid()
    )
  );

-- Política para que los usuarios puedan crear notas de clientes de su organización
CREATE POLICY "Users can create client notes in their org" 
  ON public.client_notes 
  FOR INSERT 
  WITH CHECK (
    org_id = (SELECT org_id FROM public.users WHERE id = auth.uid()) 
    AND user_id = auth.uid()
  );

-- Política para que los usuarios puedan actualizar sus propias notas
CREATE POLICY "Users can update own client notes" 
  ON public.client_notes 
  FOR UPDATE 
  USING (
    org_id = (SELECT org_id FROM public.users WHERE id = auth.uid()) 
    AND user_id = auth.uid()
  );

-- Política para que los usuarios puedan eliminar sus propias notas
CREATE POLICY "Users can delete own client notes" 
  ON public.client_notes 
  FOR DELETE 
  USING (
    org_id = (SELECT org_id FROM public.users WHERE id = auth.uid()) 
    AND user_id = auth.uid()
  );

-- Partners y Area Managers pueden ver todas las notas de su organización (incluyendo privadas)
CREATE POLICY "Partners and managers can view all org client notes" 
  ON public.client_notes 
  FOR SELECT 
  USING (
    org_id = (SELECT org_id FROM public.users WHERE id = auth.uid()) 
    AND EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND role IN ('partner', 'area_manager')
    )
  );

-- Partners y Area Managers pueden actualizar todas las notas de su organización
CREATE POLICY "Partners and managers can update all org client notes" 
  ON public.client_notes 
  FOR UPDATE 
  USING (
    org_id = (SELECT org_id FROM public.users WHERE id = auth.uid()) 
    AND EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND role IN ('partner', 'area_manager')
    )
  );

-- ========================================
-- POLÍTICAS PARA client_documents
-- ========================================

-- Política para que los usuarios puedan ver documentos de clientes de su organización
CREATE POLICY "Users can view client documents from their org" 
  ON public.client_documents 
  FOR SELECT 
  USING (org_id = (SELECT org_id FROM public.users WHERE id = auth.uid()));

-- Política para que los usuarios puedan crear documentos de clientes de su organización
CREATE POLICY "Users can create client documents in their org" 
  ON public.client_documents 
  FOR INSERT 
  WITH CHECK (
    org_id = (SELECT org_id FROM public.users WHERE id = auth.uid()) 
    AND user_id = auth.uid()
  );

-- Política para que los usuarios puedan actualizar sus propios documentos
CREATE POLICY "Users can update own client documents" 
  ON public.client_documents 
  FOR UPDATE 
  USING (
    org_id = (SELECT org_id FROM public.users WHERE id = auth.uid()) 
    AND user_id = auth.uid()
  );

-- Política para que los usuarios puedan eliminar sus propios documentos
CREATE POLICY "Users can delete own client documents" 
  ON public.client_documents 
  FOR DELETE 
  USING (
    org_id = (SELECT org_id FROM public.users WHERE id = auth.uid()) 
    AND user_id = auth.uid()
  );

-- Partners y Area Managers pueden gestionar todos los documentos de su organización
CREATE POLICY "Partners and managers can manage all org client documents" 
  ON public.client_documents 
  FOR ALL 
  USING (
    org_id = (SELECT org_id FROM public.users WHERE id = auth.uid()) 
    AND EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND role IN ('partner', 'area_manager')
    )
  )
  WITH CHECK (
    org_id = (SELECT org_id FROM public.users WHERE id = auth.uid()) 
    AND EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND role IN ('partner', 'area_manager')
    )
  );
