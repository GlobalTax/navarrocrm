-- Corregir políticas RLS para user_outlook_tokens para permitir inserción desde service role
DROP POLICY IF EXISTS "Users can insert their own outlook tokens" ON public.user_outlook_tokens;
DROP POLICY IF EXISTS "Users can update their own outlook tokens" ON public.user_outlook_tokens;
DROP POLICY IF EXISTS "Users can view their own outlook tokens" ON public.user_outlook_tokens;

-- Política para permitir que el service role inserte tokens
CREATE POLICY "Service role can manage outlook tokens" 
ON public.user_outlook_tokens 
FOR ALL 
TO service_role 
USING (true) 
WITH CHECK (true);

-- Política para que usuarios autenticados vean sus propios tokens
CREATE POLICY "Users can view their own outlook tokens" 
ON public.user_outlook_tokens 
FOR SELECT 
TO authenticated 
USING (user_id = auth.uid());

-- Política para que usuarios autenticados actualicen sus propios tokens
CREATE POLICY "Users can update their own outlook tokens" 
ON public.user_outlook_tokens 
FOR UPDATE 
TO authenticated 
USING (user_id = auth.uid()) 
WITH CHECK (user_id = auth.uid());