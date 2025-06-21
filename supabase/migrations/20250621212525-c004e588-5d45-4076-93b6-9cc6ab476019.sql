
-- Primero eliminar la función existente
DROP FUNCTION IF EXISTS public.get_task_stats(uuid);

-- Recrear la función con el tipo de retorno correcto
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
SET search_path = ''
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::INTEGER as total_tasks,
    COUNT(CASE WHEN t.status = 'pending' THEN 1 END)::INTEGER as pending_tasks,
    COUNT(CASE WHEN t.status = 'in_progress' THEN 1 END)::INTEGER as in_progress_tasks,
    COUNT(CASE WHEN t.status = 'completed' THEN 1 END)::INTEGER as completed_tasks,
    COUNT(CASE WHEN t.due_date < NOW() AND t.status != 'completed' THEN 1 END)::INTEGER as overdue_tasks,
    COUNT(CASE WHEN t.priority IN ('high', 'urgent') THEN 1 END)::INTEGER as high_priority_tasks
  FROM public.tasks t
  WHERE t.org_id = org_uuid;
END;
$function$;
