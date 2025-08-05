-- Crear foreign key entre subscription_user_assignments y users
ALTER TABLE public.subscription_user_assignments 
ADD CONSTRAINT fk_subscription_user_assignments_user_id 
FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;