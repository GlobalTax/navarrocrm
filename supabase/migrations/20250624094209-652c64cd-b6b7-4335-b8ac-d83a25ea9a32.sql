
-- Actualizar la función para generar tokens usando gen_random_uuid() en lugar de gen_random_bytes()
CREATE OR REPLACE FUNCTION public.generate_invitation_token()
RETURNS CHARACTER VARYING
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Generar un token único usando dos UUIDs concatenados sin guiones
  RETURN replace(gen_random_uuid()::text, '-', '') || replace(gen_random_uuid()::text, '-', '');
END;
$$;
