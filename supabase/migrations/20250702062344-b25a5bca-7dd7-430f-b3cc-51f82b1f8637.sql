-- Crear tabla para persistir el progreso del onboarding
CREATE TABLE public.onboarding_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL,
  user_id UUID NOT NULL,
  flow_id VARCHAR(50) NOT NULL,
  current_step_index INTEGER NOT NULL DEFAULT 0,
  completed_steps TEXT[] NOT NULL DEFAULT '{}',
  step_data JSONB NOT NULL DEFAULT '{}',
  client_data JSONB NOT NULL DEFAULT '{}',
  client_type VARCHAR(20),
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_active_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.onboarding_progress ENABLE ROW LEVEL SECURITY;

-- Crear políticas RLS
CREATE POLICY "Users can view their org onboarding progress" 
ON public.onboarding_progress 
FOR SELECT 
USING (org_id = get_user_org_id());

CREATE POLICY "Users can create onboarding progress in their org" 
ON public.onboarding_progress 
FOR INSERT 
WITH CHECK (org_id = get_user_org_id() AND user_id = auth.uid());

CREATE POLICY "Users can update their own onboarding progress" 
ON public.onboarding_progress 
FOR UPDATE 
USING (org_id = get_user_org_id() AND user_id = auth.uid());

CREATE POLICY "Users can delete their own onboarding progress" 
ON public.onboarding_progress 
FOR DELETE 
USING (org_id = get_user_org_id() AND user_id = auth.uid());

-- Crear trigger para updated_at
CREATE TRIGGER update_onboarding_progress_updated_at
  BEFORE UPDATE ON public.onboarding_progress
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();