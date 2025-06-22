
-- Crear tabla para almacenar ejecuciones de workflows
CREATE TABLE public.workflow_executions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  rule_id character varying NOT NULL,
  trigger_data jsonb,
  status character varying NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  executed_at timestamp with time zone,
  error_message text,
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Habilitar Row Level Security
ALTER TABLE public.workflow_executions ENABLE ROW LEVEL SECURITY;

-- Política para que los usuarios vean ejecuciones de su organización
CREATE POLICY "Users can view workflow executions in their organization"
  ON public.workflow_executions
  FOR SELECT
  USING (org_id = public.get_user_org_id());

-- Política para que los usuarios puedan crear ejecuciones en su organización
CREATE POLICY "Users can create workflow executions in their organization"
  ON public.workflow_executions
  FOR INSERT
  WITH CHECK (org_id = public.get_user_org_id());

-- Crear trigger para actualizar updated_at
CREATE TRIGGER update_workflow_executions_updated_at
  BEFORE UPDATE ON public.workflow_executions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Crear índices para optimización
CREATE INDEX idx_workflow_executions_org_id ON public.workflow_executions(org_id);
CREATE INDEX idx_workflow_executions_rule_id ON public.workflow_executions(rule_id);
CREATE INDEX idx_workflow_executions_status ON public.workflow_executions(status);
