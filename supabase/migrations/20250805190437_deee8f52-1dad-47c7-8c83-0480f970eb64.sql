-- Verificar si las foreign keys existen y crearlas si no
DO $$
BEGIN
    -- Intentar crear la foreign key para org_id
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'subscription_user_assignments_org_id_fkey'
    ) THEN
        ALTER TABLE public.subscription_user_assignments 
        ADD CONSTRAINT subscription_user_assignments_org_id_fkey 
        FOREIGN KEY (org_id) REFERENCES public.organizations(id) ON DELETE CASCADE;
    END IF;

    -- Intentar crear la foreign key para subscription_id
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'subscription_user_assignments_subscription_id_fkey'
    ) THEN
        ALTER TABLE public.subscription_user_assignments 
        ADD CONSTRAINT subscription_user_assignments_subscription_id_fkey 
        FOREIGN KEY (subscription_id) REFERENCES public.outgoing_subscriptions(id) ON DELETE CASCADE;
    END IF;

    -- Intentar crear la foreign key para user_id (esta es la más importante para las consultas)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'subscription_user_assignments_user_id_fkey'
    ) THEN
        ALTER TABLE public.subscription_user_assignments 
        ADD CONSTRAINT subscription_user_assignments_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
    END IF;

    -- Crear el trigger para validation si no existe
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.triggers 
        WHERE trigger_name = 'validate_subscription_assignment_trigger'
    ) THEN
        CREATE TRIGGER validate_subscription_assignment_trigger
        BEFORE INSERT OR UPDATE ON public.subscription_user_assignments
        FOR EACH ROW
        EXECUTE FUNCTION public.validate_subscription_assignment();
    END IF;
END $$;