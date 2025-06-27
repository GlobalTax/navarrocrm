
-- Primero, vamos a obtener el ID del usuario autenticado y crear el registro
-- Usando una consulta que maneje el caso donde auth.uid() podría ser null
DO $$
DECLARE
    user_uuid uuid;
    user_email text;
BEGIN
    -- Intentar obtener el usuario autenticado actual
    SELECT auth.uid() INTO user_uuid;
    
    -- Si no hay usuario autenticado, obtener el primer usuario de auth.users
    IF user_uuid IS NULL THEN
        SELECT id INTO user_uuid 
        FROM auth.users 
        ORDER BY created_at DESC 
        LIMIT 1;
    END IF;
    
    -- Obtener el email del usuario
    SELECT email INTO user_email 
    FROM auth.users 
    WHERE id = user_uuid;
    
    -- Insertar o actualizar el usuario en la tabla users
    INSERT INTO public.users (
        id,
        email,
        role,
        org_id
    ) VALUES (
        user_uuid,
        user_email,
        'partner',
        '10af28dc-a9b8-4f0a-889e-4732e07df038'
    )
    ON CONFLICT (id) DO UPDATE SET
        org_id = EXCLUDED.org_id,
        role = EXCLUDED.role,
        updated_at = now();
        
    RAISE NOTICE 'Usuario creado/actualizado: % con email: %', user_uuid, user_email;
END $$;
