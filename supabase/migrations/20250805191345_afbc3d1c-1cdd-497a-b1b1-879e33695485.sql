-- Verificar y agregar foreign keys faltantes
DO $$
BEGIN
    -- Agregar foreign key para org_id si no existe
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'subscription_user_assignments_org_id_fkey' 
        AND table_name = 'subscription_user_assignments'
    ) THEN
        BEGIN
            ALTER TABLE public.subscription_user_assignments 
            ADD CONSTRAINT subscription_user_assignments_org_id_fkey 
            FOREIGN KEY (org_id) REFERENCES public.organizations(id) ON DELETE CASCADE;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Could not add org_id foreign key: %', SQLERRM;
        END;
    END IF;

    -- Agregar foreign key para subscription_id si no existe  
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'subscription_user_assignments_subscription_id_fkey'
        AND table_name = 'subscription_user_assignments'
    ) THEN
        BEGIN
            ALTER TABLE public.subscription_user_assignments 
            ADD CONSTRAINT subscription_user_assignments_subscription_id_fkey 
            FOREIGN KEY (subscription_id) REFERENCES public.outgoing_subscriptions(id) ON DELETE CASCADE;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Could not add subscription_id foreign key: %', SQLERRM;
        END;
    END IF;

    -- Agregar foreign key para user_id si no existe
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'subscription_user_assignments_user_id_fkey'
        AND table_name = 'subscription_user_assignments'
    ) THEN
        BEGIN
            ALTER TABLE public.subscription_user_assignments 
            ADD CONSTRAINT subscription_user_assignments_user_id_fkey 
            FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Could not add user_id foreign key: %', SQLERRM;
        END;
    END IF;
END $$;