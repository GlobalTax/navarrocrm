
-- Primero, limpiemos datos inconsistentes que podrían impedir la creación de foreign keys
DELETE FROM public.tasks WHERE contact_id IS NOT NULL AND contact_id NOT IN (SELECT id FROM public.contacts);
DELETE FROM public.tasks WHERE case_id IS NOT NULL AND case_id NOT IN (SELECT id FROM public.cases);

-- Agregar foreign key constraints que faltan en la tabla tasks
ALTER TABLE public.tasks 
ADD CONSTRAINT fk_tasks_contact_id 
FOREIGN KEY (contact_id) REFERENCES public.contacts(id) ON DELETE SET NULL;

ALTER TABLE public.tasks 
ADD CONSTRAINT fk_tasks_case_id 
FOREIGN KEY (case_id) REFERENCES public.cases(id) ON DELETE SET NULL;

-- Crear índices para mejorar el rendimiento de las consultas
CREATE INDEX IF NOT EXISTS idx_tasks_contact_id ON public.tasks(contact_id);
CREATE INDEX IF NOT EXISTS idx_tasks_case_id ON public.tasks(case_id);

-- Actualizar la migración para cambiar client_id por contact_id (ya que estamos usando contacts)
ALTER TABLE public.tasks DROP COLUMN IF EXISTS client_id;

-- Crear tabla task_subtasks si no existe
CREATE TABLE IF NOT EXISTS public.task_subtasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS en task_subtasks
ALTER TABLE public.task_subtasks ENABLE ROW LEVEL SECURITY;

-- Crear políticas para task_subtasks (sin IF NOT EXISTS)
DROP POLICY IF EXISTS "Users can view task subtasks in their org" ON public.task_subtasks;
CREATE POLICY "Users can view task subtasks in their org" ON public.task_subtasks
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.tasks WHERE id = task_id AND org_id = get_user_org_id())
  );

DROP POLICY IF EXISTS "Users can create task subtasks in their org" ON public.task_subtasks;
CREATE POLICY "Users can create task subtasks in their org" ON public.task_subtasks
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.tasks WHERE id = task_id AND org_id = get_user_org_id())
  );

DROP POLICY IF EXISTS "Users can update task subtasks in their org" ON public.task_subtasks;
CREATE POLICY "Users can update task subtasks in their org" ON public.task_subtasks
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.tasks WHERE id = task_id AND org_id = get_user_org_id())
  );

DROP POLICY IF EXISTS "Users can delete task subtasks in their org" ON public.task_subtasks;
CREATE POLICY "Users can delete task subtasks in their org" ON public.task_subtasks
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.tasks WHERE id = task_id AND org_id = get_user_org_id())
  );

-- Índice para task_subtasks
CREATE INDEX IF NOT EXISTS idx_task_subtasks_task_id ON public.task_subtasks(task_id);

-- Trigger para updated_at en task_subtasks
DROP TRIGGER IF EXISTS update_task_subtasks_updated_at ON public.task_subtasks;
CREATE TRIGGER update_task_subtasks_updated_at
  BEFORE UPDATE ON public.task_subtasks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
