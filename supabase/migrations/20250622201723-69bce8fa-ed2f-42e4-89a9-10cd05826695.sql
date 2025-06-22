
-- Crear tabla para almacenar reglas de workflow
CREATE TABLE public.workflow_rules (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name character varying NOT NULL,
  description text,
  trigger_type character varying NOT NULL CHECK (trigger_type IN ('case_created', 'client_added', 'task_overdue', 'proposal_sent', 'time_logged')),
  conditions jsonb NOT NULL DEFAULT '[]'::jsonb,
  actions jsonb NOT NULL DEFAULT '[]'::jsonb,
  is_active boolean NOT NULL DEFAULT true,
  priority integer NOT NULL DEFAULT 0,
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  created_by uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Habilitar Row Level Security
ALTER TABLE public.workflow_rules ENABLE ROW LEVEL SECURITY;

-- Política para que los usuarios vean reglas de su organización
CREATE POLICY "Users can view workflow rules in their organization"
  ON public.workflow_rules
  FOR SELECT
  USING (org_id = public.get_user_org_id());

-- Política para que los usuarios puedan crear reglas en su organización
CREATE POLICY "Users can create workflow rules in their organization"
  ON public.workflow_rules
  FOR INSERT
  WITH CHECK (org_id = public.get_user_org_id() AND created_by = auth.uid());

-- Política para que los usuarios puedan actualizar reglas en su organización
CREATE POLICY "Users can update workflow rules in their organization"
  ON public.workflow_rules
  FOR UPDATE
  USING (org_id = public.get_user_org_id());

-- Política para que los usuarios puedan eliminar reglas en su organización
CREATE POLICY "Users can delete workflow rules in their organization"
  ON public.workflow_rules
  FOR DELETE
  USING (org_id = public.get_user_org_id());

-- Crear trigger para actualizar updated_at
CREATE TRIGGER update_workflow_rules_updated_at
  BEFORE UPDATE ON public.workflow_rules
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Crear índices para optimización
CREATE INDEX idx_workflow_rules_org_id ON public.workflow_rules(org_id);
CREATE INDEX idx_workflow_rules_trigger_type ON public.workflow_rules(trigger_type);
CREATE INDEX idx_workflow_rules_is_active ON public.workflow_rules(is_active);

-- Crear tabla para plantillas de workflow
CREATE TABLE public.workflow_templates (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name character varying NOT NULL,
  description text,
  category character varying NOT NULL DEFAULT 'general',
  template_data jsonb NOT NULL,
  is_system_template boolean NOT NULL DEFAULT false,
  org_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE,
  created_by uuid REFERENCES public.users(id) ON DELETE CASCADE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Habilitar Row Level Security para templates
ALTER TABLE public.workflow_templates ENABLE ROW LEVEL SECURITY;

-- Política para templates del sistema (visibles para todos)
CREATE POLICY "System templates are visible to all users"
  ON public.workflow_templates
  FOR SELECT
  USING (is_system_template = true);

-- Política para templates de organización
CREATE POLICY "Users can view org workflow templates"
  ON public.workflow_templates
  FOR SELECT
  USING (org_id = public.get_user_org_id() AND is_system_template = false);

-- Política para crear templates de organización
CREATE POLICY "Users can create org workflow templates"
  ON public.workflow_templates
  FOR INSERT
  WITH CHECK (org_id = public.get_user_org_id() AND created_by = auth.uid() AND is_system_template = false);

-- Crear trigger para templates
CREATE TRIGGER update_workflow_templates_updated_at
  BEFORE UPDATE ON public.workflow_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Crear índices para templates
CREATE INDEX idx_workflow_templates_org_id ON public.workflow_templates(org_id);
CREATE INDEX idx_workflow_templates_category ON public.workflow_templates(category);
CREATE INDEX idx_workflow_templates_is_system ON public.workflow_templates(is_system_template);

-- Insertar algunas plantillas del sistema
INSERT INTO public.workflow_templates (name, description, category, template_data, is_system_template) VALUES
('Nuevo Cliente - Bienvenida', 'Envía email de bienvenida y crea tareas iniciales cuando se añade un nuevo cliente', 'client_management', 
 '{"trigger": "client_added", "conditions": [], "actions": [{"type": "send_email", "parameters": {"template": "welcome_client"}}, {"type": "create_task", "parameters": {"title": "Configurar expediente inicial", "priority": "high"}}]}'::jsonb, true),
('Expediente Creado - Legal', 'Crea tareas estándar para nuevos expedientes legales', 'legal', 
 '{"trigger": "case_created", "conditions": [{"field": "practice_area", "operator": "equals", "value": "legal"}], "actions": [{"type": "create_task", "parameters": {"title": "Revisión inicial de documentos", "priority": "high"}}, {"type": "create_task", "parameters": {"title": "Contactar con cliente para información adicional", "priority": "medium"}}]}'::jsonb, true),
('Tarea Vencida - Recordatorio', 'Envía notificaciones cuando una tarea se vence', 'task_management', 
 '{"trigger": "task_overdue", "conditions": [], "actions": [{"type": "create_notification", "parameters": {"title": "Tarea Vencida", "message": "La tarea {{task.title}} ha superado su fecha límite"}}, {"type": "send_email", "parameters": {"template": "task_overdue_reminder"}}]}'::jsonb, true);
