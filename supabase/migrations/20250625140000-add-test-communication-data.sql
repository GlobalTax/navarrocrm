
-- Insertar datos de prueba para comunicaciones del cliente ENDESA SA
-- Nota: Estos son datos de ejemplo para mostrar la funcionalidad

-- Insertar hilos de email de prueba
INSERT INTO public.email_threads (
  id,
  org_id,
  thread_subject,
  participants,
  message_count,
  last_message_at,
  status,
  contact_id,
  created_by,
  created_at,
  updated_at
) VALUES 
(
  gen_random_uuid(),
  (SELECT org_id FROM public.contacts WHERE name = 'ENDESA SA' LIMIT 1),
  'Consulta sobre facturación energética',
  ARRAY['endesa@endesa.es', 'legal@bufete.es'],
  3,
  NOW() - INTERVAL '2 days',
  'active',
  (SELECT id FROM public.contacts WHERE name = 'ENDESA SA' LIMIT 1),
  (SELECT id FROM public.users LIMIT 1),
  NOW() - INTERVAL '5 days',
  NOW() - INTERVAL '2 days'
),
(
  gen_random_uuid(),
  (SELECT org_id FROM public.contacts WHERE name = 'ENDESA SA' LIMIT 1),
  'Propuesta de asesoría regulatoria',
  ARRAY['endesa@endesa.es', 'regulatorio@bufete.es'],
  2,
  NOW() - INTERVAL '1 week',
  'completed',
  (SELECT id FROM public.contacts WHERE name = 'ENDESA SA' LIMIT 1),
  (SELECT id FROM public.users LIMIT 1),
  NOW() - INTERVAL '2 weeks',
  NOW() - INTERVAL '1 week'
);

-- Insertar eventos de calendario de prueba
INSERT INTO public.calendar_events (
  id,
  org_id,
  title,
  description,
  start_datetime,
  end_datetime,
  event_type,
  status,
  contact_id,
  created_by,
  attendees_emails,
  location,
  created_at,
  updated_at
) VALUES 
(
  gen_random_uuid(),
  (SELECT org_id FROM public.contacts WHERE name = 'ENDESA SA' LIMIT 1),
  'Reunión estratégica Q1',
  'Revisión de objetivos y estrategia para el primer trimestre',
  NOW() - INTERVAL '3 days',
  NOW() - INTERVAL '3 days' + INTERVAL '2 hours',
  'meeting',
  'completed',
  (SELECT id FROM public.contacts WHERE name = 'ENDESA SA' LIMIT 1),
  (SELECT id FROM public.users LIMIT 1),
  ARRAY['endesa@endesa.es', 'director@bufete.es'],
  'Oficinas ENDESA, Madrid',
  NOW() - INTERVAL '1 week',
  NOW() - INTERVAL '3 days'
),
(
  gen_random_uuid(),
  (SELECT org_id FROM public.contacts WHERE name = 'ENDESA SA' LIMIT 1),
  'Llamada de seguimiento',
  'Seguimiento de temas regulatorios pendientes',
  NOW() - INTERVAL '1 day',
  NOW() - INTERVAL '1 day' + INTERVAL '30 minutes',
  'call',
  'completed',
  (SELECT id FROM public.contacts WHERE name = 'ENDESA SA' LIMIT 1),
  (SELECT id FROM public.users LIMIT 1),
  ARRAY['endesa@endesa.es'],
  NULL,
  NOW() - INTERVAL '2 days',
  NOW() - INTERVAL '1 day'
);

-- Insertar notas de contacto de prueba
INSERT INTO public.contact_notes (
  id,
  org_id,
  contact_id,
  user_id,
  title,
  content,
  note_type,
  is_private,
  created_at,
  updated_at
) VALUES 
(
  gen_random_uuid(),
  (SELECT org_id FROM public.contacts WHERE name = 'ENDESA SA' LIMIT 1),
  (SELECT id FROM public.contacts WHERE name = 'ENDESA SA' LIMIT 1),
  (SELECT id FROM public.users LIMIT 1),
  'Reunión inicial muy productiva',
  'El cliente mostró gran interés en nuestros servicios de asesoría regulatoria. Necesidades específicas: compliance energético, restructuración tarifaria.',
  'reunion',
  false,
  NOW() - INTERVAL '1 week',
  NOW() - INTERVAL '1 week'
),
(
  gen_random_uuid(),
  (SELECT org_id FROM public.contacts WHERE name = 'ENDESA SA' LIMIT 1),
  (SELECT id FROM public.contacts WHERE name = 'ENDESA SA' LIMIT 1),
  (SELECT id FROM public.users LIMIT 1),
  'Seguimiento post-reunión',
  'Enviados documentos solicitados. Cliente confirmó interés en propuesta. Próxima reunión programada para la próxima semana.',
  'general',
  false,
  NOW() - INTERVAL '5 days',
  NOW() - INTERVAL '5 days'
),
(
  gen_random_uuid(),
  (SELECT org_id FROM public.contacts WHERE name = 'ENDESA SA' LIMIT 1),
  (SELECT id FROM public.contacts WHERE name = 'ENDESA SA' LIMIT 1),
  (SELECT id FROM public.users LIMIT 1),
  'Nota interna - Estrategia',
  'Cliente clave para expansión en sector energético. Considerar asignación de equipo especializado.',
  'general',
  true,
  NOW() - INTERVAL '3 days',
  NOW() - INTERVAL '3 days'
);
