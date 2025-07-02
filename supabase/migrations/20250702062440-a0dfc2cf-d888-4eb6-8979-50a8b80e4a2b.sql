-- Añadir constraint único para user_id y flow_id
ALTER TABLE public.onboarding_progress 
ADD CONSTRAINT unique_user_flow UNIQUE (user_id, flow_id);