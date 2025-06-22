
-- Crear tabla para subtareas
CREATE TABLE public.task_subtasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS en task_subtasks
ALTER TABLE public.task_subtasks ENABLE ROW LEVEL SECURITY;

-- Crear políticas RLS para task_subtasks
CREATE POLICY "Users can view task subtasks in their org" ON public.task_subtasks
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.tasks WHERE id = task_id AND org_id = get_user_org_id())
  );

CREATE POLICY "Users can create task subtasks in their org" ON public.task_subtasks
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.tasks WHERE id = task_id AND org_id = get_user_org_id())
  );

CREATE POLICY "Users can update task subtasks in their org" ON public.task_subtasks
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.tasks WHERE id = task_id AND org_id = get_user_org_id())
  );

CREATE POLICY "Users can delete task subtasks in their org" ON public.task_subtasks
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.tasks WHERE id = task_id AND org_id = get_user_org_id())
  );

-- Crear trigger para updated_at en task_subtasks
CREATE TRIGGER update_task_subtasks_updated_at 
  BEFORE UPDATE ON public.task_subtasks 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Añadir nueva prioridad 'critical' al enum task_priority (solo si no existe)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'critical' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'task_priority')) THEN
        ALTER TYPE task_priority ADD VALUE 'critical';
    END IF;
END $$;

-- Añadir nuevos estados al enum task_status (solo si no existen)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'investigation' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'task_status')) THEN
        ALTER TYPE task_status ADD VALUE 'investigation';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'drafting' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'task_status')) THEN
        ALTER TYPE task_status ADD VALUE 'drafting';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'review' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'task_status')) THEN
        ALTER TYPE task_status ADD VALUE 'review';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'filing' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'task_status')) THEN
        ALTER TYPE task_status ADD VALUE 'filing';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'hearing' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'task_status')) THEN
        ALTER TYPE task_status ADD VALUE 'hearing';
    END IF;
END $$;

-- Crear índices para optimizar performance
CREATE INDEX IF NOT EXISTS idx_task_subtasks_task_id ON public.task_subtasks(task_id);
CREATE INDEX IF NOT EXISTS idx_task_subtasks_completed ON public.task_subtasks(completed);
CREATE INDEX IF NOT EXISTS idx_task_comments_task_id ON public.task_comments(task_id);
CREATE INDEX IF NOT EXISTS idx_task_assignments_task_id ON public.task_assignments(task_id);
