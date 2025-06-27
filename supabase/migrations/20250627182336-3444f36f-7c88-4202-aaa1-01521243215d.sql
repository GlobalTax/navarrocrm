
-- Crear solo la tabla que falta para operaciones masivas de tareas
CREATE TABLE public.task_bulk_operations (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    org_id UUID NOT NULL REFERENCES public.organizations(id),
    operation_type VARCHAR NOT NULL CHECK (operation_type IN ('create', 'assign', 'update', 'delete')),
    status VARCHAR NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    total_tasks INTEGER NOT NULL DEFAULT 0,
    processed_tasks INTEGER NOT NULL DEFAULT 0,
    failed_tasks INTEGER NOT NULL DEFAULT 0,
    operation_data JSONB DEFAULT '{}',
    error_log JSONB DEFAULT '{}',
    created_by UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Habilitar RLS
ALTER TABLE public.task_bulk_operations ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para task_bulk_operations
CREATE POLICY "Users can view their org's bulk operations" 
ON public.task_bulk_operations FOR SELECT 
USING (org_id = (SELECT org_id FROM public.users WHERE id = auth.uid()));

CREATE POLICY "Users can create bulk operations for their org" 
ON public.task_bulk_operations FOR INSERT 
WITH CHECK (org_id = (SELECT org_id FROM public.users WHERE id = auth.uid()));

CREATE POLICY "Users can update their org's bulk operations" 
ON public.task_bulk_operations FOR UPDATE 
USING (org_id = (SELECT org_id FROM public.users WHERE id = auth.uid()));

-- Índices para mejorar el rendimiento
CREATE INDEX idx_task_bulk_operations_org_id ON public.task_bulk_operations(org_id);
CREATE INDEX idx_task_bulk_operations_status ON public.task_bulk_operations(status);

-- Trigger para actualizar updated_at
CREATE TRIGGER update_task_bulk_operations_updated_at
    BEFORE UPDATE ON public.task_bulk_operations
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- También verificar si task_templates tiene la columna category, si no la tiene, agregarla
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'task_templates' 
        AND column_name = 'category'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.task_templates ADD COLUMN category VARCHAR DEFAULT 'general';
    END IF;
END $$;
