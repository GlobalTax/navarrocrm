
-- Crear tabla para textos por defecto parametrizables
CREATE TABLE public.default_proposal_texts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  practice_area VARCHAR(50) NOT NULL,
  introduction_text TEXT NOT NULL,
  terms_text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID NOT NULL REFERENCES auth.users(id),
  UNIQUE(org_id, practice_area)
);

-- Habilitar RLS
ALTER TABLE public.default_proposal_texts ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Users can view their org default texts" 
  ON public.default_proposal_texts 
  FOR SELECT 
  USING (org_id = get_user_org_id());

CREATE POLICY "Users can create default texts in their org" 
  ON public.default_proposal_texts 
  FOR INSERT 
  WITH CHECK (org_id = get_user_org_id() AND created_by = auth.uid());

CREATE POLICY "Users can update their org default texts" 
  ON public.default_proposal_texts 
  FOR UPDATE 
  USING (org_id = get_user_org_id());

CREATE POLICY "Users can delete their org default texts" 
  ON public.default_proposal_texts 
  FOR DELETE 
  USING (org_id = get_user_org_id());

-- Trigger para actualizar updated_at
CREATE TRIGGER update_default_proposal_texts_updated_at
  BEFORE UPDATE ON public.default_proposal_texts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
