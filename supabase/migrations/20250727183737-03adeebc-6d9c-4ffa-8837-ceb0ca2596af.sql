-- Insertar plantillas predefinidas de suscripciones para todas las organizaciones
INSERT INTO public.subscription_templates (
  org_id, 
  name, 
  category, 
  default_price, 
  default_billing_cycle, 
  default_currency, 
  default_payment_method, 
  provider_website, 
  description, 
  is_active, 
  usage_count, 
  created_by
)
SELECT 
  o.id as org_id,
  template.name,
  template.category,
  template.default_price,
  template.default_billing_cycle,
  'EUR' as default_currency,
  template.default_payment_method,
  template.provider_website,
  template.description,
  true as is_active,
  0 as usage_count,
  (SELECT u.id FROM public.users u WHERE u.org_id = o.id ORDER BY u.created_at ASC LIMIT 1) as created_by
FROM public.organizations o
CROSS JOIN (
  VALUES 
    ('ChatGPT Plus', 'IA'::character varying, 20.00, 'MONTHLY'::character varying, 'VISA', 'https://openai.com', 'Suscripción mensual a ChatGPT Plus con GPT-4'),
    ('Notion Pro', 'SOFTWARE'::character varying, 10.00, 'MONTHLY'::character varying, 'VISA', 'https://notion.so', 'Plan profesional de Notion para equipos'),
    ('Google Workspace Business', 'SOFTWARE'::character varying, 13.00, 'MONTHLY'::character varying, 'Transferencia', 'https://workspace.google.com', 'Suite de productividad empresarial de Google'),
    ('Figma Pro', 'DISENO'::character varying, 12.00, 'MONTHLY'::character varying, 'VISA', 'https://figma.com', 'Herramienta de diseño colaborativo profesional'),
    ('Canva Pro', 'MARKETING'::character varying, 11.99, 'MONTHLY'::character varying, 'VISA', 'https://canva.com', 'Plataforma de diseño gráfico profesional'),
    ('Slack Pro', 'COMUNICACION'::character varying, 7.25, 'MONTHLY'::character varying, 'VISA', 'https://slack.com', 'Plataforma de comunicación empresarial'),
    ('GitHub Pro', 'SOFTWARE'::character varying, 4.00, 'MONTHLY'::character varying, 'VISA', 'https://github.com', 'Plan profesional de GitHub con repositorios privados'),
    ('Dropbox Business', 'INFRAESTRUCTURA'::character varying, 15.00, 'MONTHLY'::character varying, 'VISA', 'https://dropbox.com', 'Almacenamiento en la nube para empresas'),
    ('Zoom Pro', 'COMUNICACION'::character varying, 13.99, 'MONTHLY'::character varying, 'VISA', 'https://zoom.us', 'Plataforma de videoconferencias profesional'),
    ('Adobe Creative Cloud', 'DISENO'::character varying, 52.99, 'MONTHLY'::character varying, 'VISA', 'https://adobe.com', 'Suite completa de herramientas de diseño Adobe'),
    ('Microsoft 365 Business', 'SOFTWARE'::character varying, 12.60, 'MONTHLY'::character varying, 'VISA', 'https://microsoft.com', 'Suite de productividad de Microsoft para empresas'),
    ('Salesforce Professional', 'SOFTWARE'::character varying, 80.00, 'MONTHLY'::character varying, 'VISA', 'https://salesforce.com', 'CRM profesional de Salesforce')
) AS template(name, category, default_price, default_billing_cycle, default_payment_method, provider_website, description)
WHERE EXISTS (SELECT 1 FROM public.users u WHERE u.org_id = o.id)
ON CONFLICT (org_id, name) DO NOTHING;