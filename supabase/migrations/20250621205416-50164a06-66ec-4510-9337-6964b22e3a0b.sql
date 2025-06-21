
-- Crear enum para prioridades de tareas
CREATE TYPE public.task_priority AS ENUM ('low', 'medium', 'high', 'urgent');

-- Crear enum para estados de tareas
CREATE TYPE public.task_status AS ENUM ('pending', 'in_progress', 'completed', 'cancelled');

-- Crear tabla principal de tareas
CREATE TABLE public.tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  priority public.task_priority NOT NULL DEFAULT 'medium',
  status public.task_status NOT NULL DEFAULT 'pending',
  due_date TIMESTAMP WITH TIME ZONE,
  start_date TIMESTAMP WITH TIME ZONE,
  estimated_hours INTEGER DEFAULT 0,
  actual_hours INTEGER DEFAULT 0,
  created_by UUID NOT NULL REFERENCES public.users(id),
  case_id UUID REFERENCES public.cases(id) ON DELETE SET NULL,
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  parent_task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE,
  tags TEXT[] DEFAULT '{}',
  is_recurring BOOLEAN DEFAULT FALSE,
  recurring_pattern JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Crear tabla de asignaciones de tareas
CREATE TABLE public.task_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  assigned_by UUID NOT NULL REFERENCES public.users(id),
  assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  role VARCHAR(50) DEFAULT 'assignee',
  UNIQUE(task_id, user_id)
);

-- Crear tabla de comentarios de tareas
CREATE TABLE public.task_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id),
  content TEXT NOT NULL,
  mentions UUID[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Crear tabla de archivos adjuntos de tareas
CREATE TABLE public.task_attachments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  file_name VARCHAR(255) NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER,
  file_type VARCHAR(100),
  uploaded_by UUID NOT NULL REFERENCES public.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Crear tabla de plantillas de tareas
CREATE TABLE public.task_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  template_data JSONB NOT NULL,
  created_by UUID NOT NULL REFERENCES public.users(id),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS en todas las tablas
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_templates ENABLE ROW LEVEL SECURITY;

-- Crear políticas RLS para tasks
CREATE POLICY "Users can view tasks in their org" ON public.tasks
  FOR SELECT USING (org_id = get_user_org_id());

CREATE POLICY "Users can create tasks in their org" ON public.tasks
  FOR INSERT WITH CHECK (org_id = get_user_org_id());

CREATE POLICY "Users can update tasks in their org" ON public.tasks
  FOR UPDATE USING (org_id = get_user_org_id());

CREATE POLICY "Users can delete tasks in their org" ON public.tasks
  FOR DELETE USING (org_id = get_user_org_id());

-- Crear políticas RLS para task_assignments
CREATE POLICY "Users can view task assignments in their org" ON public.task_assignments
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.tasks WHERE id = task_id AND org_id = get_user_org_id())
  );

CREATE POLICY "Users can create task assignments in their org" ON public.task_assignments
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.tasks WHERE id = task_id AND org_id = get_user_org_id())
  );

CREATE POLICY "Users can update task assignments in their org" ON public.task_assignments
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.tasks WHERE id = task_id AND org_id = get_user_org_id())
  );

CREATE POLICY "Users can delete task assignments in their org" ON public.task_assignments
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.tasks WHERE id = task_id AND org_id = get_user_org_id())
  );

-- Crear políticas RLS para task_comments
CREATE POLICY "Users can view task comments in their org" ON public.task_comments
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.tasks WHERE id = task_id AND org_id = get_user_org_id())
  );

CREATE POLICY "Users can create task comments in their org" ON public.task_comments
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.tasks WHERE id = task_id AND org_id = get_user_org_id())
  );

CREATE POLICY "Users can update their own task comments" ON public.task_comments
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own task comments" ON public.task_comments
  FOR DELETE USING (user_id = auth.uid());

-- Crear políticas RLS para task_attachments
CREATE POLICY "Users can view task attachments in their org" ON public.task_attachments
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.tasks WHERE id = task_id AND org_id = get_user_org_id())
  );

CREATE POLICY "Users can create task attachments in their org" ON public.task_attachments
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.tasks WHERE id = task_id AND org_id = get_user_org_id())
  );

CREATE POLICY "Users can delete task attachments in their org" ON public.task_attachments
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.tasks WHERE id = task_id AND org_id = get_user_org_id())
  );

-- Crear políticas RLS para task_templates
CREATE POLICY "Users can view task templates in their org" ON public.task_templates
  FOR SELECT USING (org_id = get_user_org_id());

CREATE POLICY "Users can create task templates in their org" ON public.task_templates
  FOR INSERT WITH CHECK (org_id = get_user_org_id());

CREATE POLICY "Users can update task templates in their org" ON public.task_templates
  FOR UPDATE USING (org_id = get_user_org_id());

CREATE POLICY "Users can delete task templates in their org" ON public.task_templates
  FOR DELETE USING (org_id = get_user_org_id());

-- Crear índices para mejorar rendimiento
CREATE INDEX idx_tasks_org_id ON public.tasks(org_id);
CREATE INDEX idx_tasks_status ON public.tasks(status);
CREATE INDEX idx_tasks_priority ON public.tasks(priority);
CREATE INDEX idx_tasks_due_date ON public.tasks(due_date);
CREATE INDEX idx_tasks_created_by ON public.tasks(created_by);
CREATE INDEX idx_tasks_case_id ON public.tasks(case_id);
CREATE INDEX idx_tasks_client_id ON public.tasks(client_id);
CREATE INDEX idx_task_assignments_task_id ON public.task_assignments(task_id);
CREATE INDEX idx_task_assignments_user_id ON public.task_assignments(user_id);
CREATE INDEX idx_task_comments_task_id ON public.task_comments(task_id);
CREATE INDEX idx_task_attachments_task_id ON public.task_attachments(task_id);

-- Crear trigger para actualizar updated_at
CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_task_comments_updated_at
  BEFORE UPDATE ON public.task_comments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_task_templates_updated_at
  BEFORE UPDATE ON public.task_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Crear función para generar estadísticas de tareas
CREATE OR REPLACE FUNCTION public.get_task_stats(org_uuid UUID)
RETURNS TABLE (
  total_tasks INTEGER,
  pending_tasks INTEGER,
  in_progress_tasks INTEGER,
  completed_tasks INTEGER,
  overdue_tasks INTEGER,
  high_priority_tasks INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::INTEGER as total_tasks,
    COUNT(*) FILTER (WHERE status = 'pending')::INTEGER as pending_tasks,
    COUNT(*) FILTER (WHERE status = 'in_progress')::INTEGER as in_progress_tasks,
    COUNT(*) FILTER (WHERE status = 'completed')::INTEGER as completed_tasks,
    COUNT(*) FILTER (WHERE due_date < NOW() AND status NOT IN ('completed', 'cancelled'))::INTEGER as overdue_tasks,
    COUNT(*) FILTER (WHERE priority IN ('high', 'urgent'))::INTEGER as high_priority_tasks
  FROM public.tasks 
  WHERE org_id = org_uuid;
END;
$$;
