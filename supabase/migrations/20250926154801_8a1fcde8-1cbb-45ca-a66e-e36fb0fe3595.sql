-- Arreglar el problema de seguridad en la función cleanup_expired_credentials
CREATE OR REPLACE FUNCTION cleanup_expired_credentials()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  DELETE FROM public.user_credentials_temp 
  WHERE expires_at < now();
END;
$$;