-- Insert Lovable Pro and Supabase Pro subscription templates
INSERT INTO public.subscription_templates (
  name,
  category,
  default_price,
  default_billing_cycle,
  default_payment_method,
  provider_website,
  description,
  notes,
  org_id,
  created_by,
  is_active
) VALUES 
(
  'Lovable Pro',
  'SOFTWARE',
  20.00,
  'MONTHLY',
  'VISA',
  'https://lovable.dev',
  'Plataforma de desarrollo con IA para crear aplicaciones web',
  'Desarrollo visual con inteligencia artificial, integración con bases de datos y despliegue automático',
  (SELECT id FROM public.organizations LIMIT 1),
  (SELECT id FROM public.users LIMIT 1),
  true
),
(
  'Supabase Pro',
  'SOFTWARE', 
  25.00,
  'MONTHLY',
  'VISA',
  'https://supabase.com',
  'Backend as a Service con base de datos PostgreSQL, autenticación y APIs',
  'Incluye base de datos PostgreSQL, autenticación, APIs REST y realtime, storage y edge functions',
  (SELECT id FROM public.organizations LIMIT 1),
  (SELECT id FROM public.users LIMIT 1),
  true
);