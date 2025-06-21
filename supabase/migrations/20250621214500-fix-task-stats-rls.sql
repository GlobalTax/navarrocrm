
-- Habilitar RLS en la tabla tasks (si no está ya habilitado)
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- Crear políticas RLS para tasks si no existen
CREATE POLICY IF NOT EXISTS "Users can view tasks in their org" ON public.tasks
  FOR SELECT USING (org_id = get_user_org_id());

CREATE POLICY IF NOT EXISTS "Users can create tasks in their org" ON public.tasks
  FOR INSERT WITH CHECK (org_id = get_user_org_id());

CREATE POLICY IF NOT EXISTS "Users can update tasks in their org" ON public.tasks
  FOR UPDATE USING (org_id = get_user_org_id());

CREATE POLICY IF NOT EXISTS "Users can delete tasks in their org" ON public.tasks
  FOR DELETE USING (org_id = get_user_org_id());

-- Habilitar RLS en task_assignments
ALTER TABLE public.task_assignments ENABLE ROW LEVEL SECURITY;

-- Crear políticas para task_assignments
CREATE POLICY IF NOT EXISTS "Users can view task assignments in their org" ON public.task_assignments
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.tasks WHERE id = task_id AND org_id = get_user_org_id())
  );

CREATE POLICY IF NOT EXISTS "Users can create task assignments in their org" ON public.task_assignments
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.tasks WHERE id = task_id AND org_id = get_user_org_id())
  );

CREATE POLICY IF NOT EXISTS "Users can update task assignments in their org" ON public.task_assignments
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.tasks WHERE id = task_id AND org_id = get_user_org_id())
  );

CREATE POLICY IF NOT EXISTS "Users can delete task assignments in their org" ON public.task_assignments
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.tasks WHERE id = task_id AND org_id = get_user_org_id())
  );
