-- Permitir NULL en refresh_token_encrypted ya que Microsoft no siempre proporciona refresh tokens
ALTER TABLE public.user_outlook_tokens 
ALTER COLUMN refresh_token_encrypted DROP NOT NULL;