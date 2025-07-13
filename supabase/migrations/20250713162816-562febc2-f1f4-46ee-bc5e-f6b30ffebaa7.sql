-- Verificar y optimizar la tabla user_outlook_tokens
DO $$ 
BEGIN
    -- Verificar si la tabla existe, si no, crearla
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user_outlook_tokens') THEN
        CREATE TABLE public.user_outlook_tokens (
            id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
            user_id UUID NOT NULL,
            org_id UUID NOT NULL,
            access_token_encrypted TEXT NOT NULL,
            refresh_token_encrypted TEXT,
            token_expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
            scope_permissions TEXT[] DEFAULT '{}',
            outlook_email CHARACTER VARYING NOT NULL,
            is_active BOOLEAN NOT NULL DEFAULT true,
            last_used_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
            created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            UNIQUE(user_id, org_id)
        );
        
        -- Habilitar RLS
        ALTER TABLE public.user_outlook_tokens ENABLE ROW LEVEL SECURITY;
        
        -- Crear políticas RLS
        CREATE POLICY "Users can manage their own outlook tokens" 
        ON public.user_outlook_tokens 
        FOR ALL 
        USING (user_id = auth.uid());
        
        -- Crear índices para mejor rendimiento
        CREATE INDEX idx_user_outlook_tokens_user_org ON public.user_outlook_tokens(user_id, org_id);
        CREATE INDEX idx_user_outlook_tokens_active ON public.user_outlook_tokens(is_active) WHERE is_active = true;
        CREATE INDEX idx_user_outlook_tokens_expires ON public.user_outlook_tokens(token_expires_at);
        
        -- Trigger para actualizar updated_at
        CREATE TRIGGER update_user_outlook_tokens_updated_at
            BEFORE UPDATE ON public.user_outlook_tokens
            FOR EACH ROW
            EXECUTE FUNCTION public.update_updated_at_column();
            
        RAISE NOTICE 'Tabla user_outlook_tokens creada exitosamente';
    ELSE
        RAISE NOTICE 'Tabla user_outlook_tokens ya existe';
    END IF;
    
    -- Verificar que las columnas necesarias existan
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'user_outlook_tokens' AND column_name = 'scope_permissions') THEN
        ALTER TABLE public.user_outlook_tokens ADD COLUMN scope_permissions TEXT[] DEFAULT '{}';
        RAISE NOTICE 'Columna scope_permissions añadida';
    END IF;
    
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'user_outlook_tokens' AND column_name = 'last_used_at') THEN
        ALTER TABLE public.user_outlook_tokens ADD COLUMN last_used_at TIMESTAMP WITH TIME ZONE DEFAULT now();
        RAISE NOTICE 'Columna last_used_at añadida';
    END IF;
END $$;