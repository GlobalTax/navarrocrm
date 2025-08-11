-- Habilitar Realtime para la tabla deeds
ALTER TABLE public.deeds REPLICA IDENTITY FULL;
DO $$ BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.deeds;
  EXCEPTION WHEN duplicate_object THEN
    -- ya estaba añadida
    NULL;
  END;
END $$;