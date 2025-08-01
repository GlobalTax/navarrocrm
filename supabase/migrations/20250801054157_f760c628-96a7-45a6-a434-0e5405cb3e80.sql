-- Insert Webflow CMS and Flowbase Pro+ subscription templates
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
  'Webflow CMS',
  'DISENO',
  23.00,
  'MONTHLY',
  'VISA',
  'https://webflow.com',
  'Plataforma de diseño web visual con CMS integrado',
  'Diseño web visual sin código, CMS potente, hosting rápido y SEO optimizado',
  (SELECT id FROM public.organizations LIMIT 1),
  (SELECT id FROM public.users LIMIT 1),
  true
),
(
  'Flowbase Pro+',
  'DISENO', 
  39.00,
  'MONTHLY',
  'VISA',
  'https://flowbase.co',
  'Biblioteca premium de componentes y templates para Webflow',
  'Componentes profesionales, templates premium, actualizaciones mensuales y soporte prioritario',
  (SELECT id FROM public.organizations LIMIT 1),
  (SELECT id FROM public.users LIMIT 1),
  true
);