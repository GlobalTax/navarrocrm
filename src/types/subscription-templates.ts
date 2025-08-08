export interface SubscriptionTemplate {
  id: string
  org_id: string
  name: string
  category: 'SOFTWARE' | 'IA' | 'MARKETING' | 'SERVICIOS_LEGALES' | 'INFRAESTRUCTURA' | 'DISENO' | 'COMUNICACION' | 'OTROS'
  default_price: number
  default_billing_cycle: 'MONTHLY' | 'YEARLY' | 'OTHER'
  default_currency: string
  default_payment_method?: string
  provider_website?: string
  description?: string
  notes?: string
  is_active: boolean
  usage_count: number
  created_by: string
  created_at: string
  updated_at: string
}

export interface CreateSubscriptionTemplateData {
  name: string
  category: SubscriptionTemplate['category']
  default_price: number
  default_billing_cycle: SubscriptionTemplate['default_billing_cycle']
  default_currency?: string
  default_payment_method?: string
  provider_website?: string
  description?: string
  notes?: string
}

export const TEMPLATE_CATEGORIES = [
  { value: 'SOFTWARE', label: 'Software' },
  { value: 'IA', label: 'Inteligencia Artificial' },
  { value: 'MARKETING', label: 'Marketing' },
  { value: 'SERVICIOS_LEGALES', label: 'Servicios Legales' },
  { value: 'INFRAESTRUCTURA', label: 'Infraestructura' },
  { value: 'DISENO', label: 'Diseño' },
  { value: 'COMUNICACION', label: 'Comunicación' },
  { value: 'OTROS', label: 'Otros' }
] as const

export const BILLING_CYCLES = [
  { value: 'MONTHLY', label: 'Mensual' },
  { value: 'YEARLY', label: 'Anual' },
  { value: 'OTHER', label: 'Otro' }
] as const

export const POPULAR_TEMPLATES = [
  // Desarrollo y Software
  {
    name: 'Lovable Pro',
    category: 'SOFTWARE' as const,
    default_price: 20.00,
    default_billing_cycle: 'MONTHLY' as const,
    default_payment_method: 'VISA',
    provider_website: 'https://lovable.dev',
    description: 'Plataforma de desarrollo con IA para crear aplicaciones web',
    notes: 'Desarrollo visual con inteligencia artificial, integración con bases de datos y despliegue automático'
  },
  {
    name: 'Supabase Pro',
    category: 'SOFTWARE' as const,
    default_price: 25.00,
    default_billing_cycle: 'MONTHLY' as const,
    default_payment_method: 'VISA',
    provider_website: 'https://supabase.com',
    description: 'Backend as a Service con base de datos PostgreSQL, autenticación y APIs',
    notes: 'Incluye base de datos PostgreSQL, autenticación, APIs REST y realtime, storage y edge functions'
  },
  {
    name: 'Notion Pro',
    category: 'SOFTWARE' as const,
    default_price: 10.00,
    default_billing_cycle: 'MONTHLY' as const,
    default_payment_method: 'VISA',
    provider_website: 'https://notion.so',
    description: 'Plan profesional de Notion para equipos'
  },
  {
    name: 'Google Workspace Business',
    category: 'SOFTWARE' as const,
    default_price: 13.00,
    default_billing_cycle: 'MONTHLY' as const,
    default_payment_method: 'Transferencia',
    provider_website: 'https://workspace.google.com',
    description: 'Suite de productividad empresarial de Google'
  },
  {
    name: 'Microsoft 365 Business Standard',
    category: 'SOFTWARE' as const,
    default_price: 12.50,
    default_billing_cycle: 'MONTHLY' as const,
    default_payment_method: 'VISA',
    provider_website: 'https://www.microsoft.com/microsoft-365',
    description: 'Suite completa de productividad con Office y Teams'
  },
  {
    name: 'Webflow CMS',
    category: 'SOFTWARE' as const,
    default_price: 23.00,
    default_billing_cycle: 'MONTHLY' as const,
    default_payment_method: 'VISA',
    provider_website: 'https://webflow.com',
    description: 'Plataforma visual de desarrollo web con CMS integrado'
  },
  {
    name: 'Cursor Hobby',
    category: 'SOFTWARE' as const,
    default_price: 0.00,
    default_billing_cycle: 'MONTHLY' as const,
    default_payment_method: 'GRATIS',
    provider_website: 'https://cursor.com',
    description: 'Editor de código con IA - Plan gratuito',
    notes: '2000 completados, 50 requests premium lentos, trial de 2 semanas Pro'
  },
  {
    name: 'Cursor Pro',
    category: 'SOFTWARE' as const,
    default_price: 20.00,
    default_billing_cycle: 'MONTHLY' as const,
    default_payment_method: 'VISA',
    provider_website: 'https://cursor.com',
    description: 'Editor de código con IA - Plan profesional',
    notes: 'Completados ilimitados, 500 requests premium rápidos/mes, 10 usos o1-mini/día'
  },
  {
    name: 'Cursor Business',
    category: 'SOFTWARE' as const,
    default_price: 40.00,
    default_billing_cycle: 'MONTHLY' as const,
    default_payment_method: 'VISA',
    provider_website: 'https://cursor.com',
    description: 'Editor de código con IA - Plan empresarial',
    notes: 'Todo lo de Pro + funciones empresariales avanzadas'
  },

  // Inteligencia Artificial
  {
    name: 'ChatGPT Plus',
    category: 'IA' as const,
    default_price: 20.00,
    default_billing_cycle: 'MONTHLY' as const,
    default_payment_method: 'VISA',
    provider_website: 'https://openai.com',
    description: 'Suscripción mensual a ChatGPT Plus con GPT-4'
  },
  {
    name: 'Google Gemini Advanced',
    category: 'IA' as const,
    default_price: 19.99,
    default_billing_cycle: 'MONTHLY' as const,
    default_payment_method: 'VISA',
    provider_website: 'https://gemini.google.com',
    description: 'Acceso ilimitado a Gemini Advanced con 2TB de almacenamiento',
    notes: 'Incluye Google One AI Premium, Gemini 2.0 Flash Experimental'
  },
  {
    name: 'Gemini Ultra',
    category: 'IA' as const,
    default_price: 249.99,
    default_billing_cycle: 'MONTHLY' as const,
    default_payment_method: 'VISA',
    provider_website: 'https://gemini.google.com',
    description: 'Plan más potente de Google AI con límites máximos',
    notes: 'Modelos más potentes, herramientas creativas avanzadas, límites de uso más altos'
  },
  {
    name: 'Manus AI Starter',
    category: 'IA' as const,
    default_price: 39.00,
    default_billing_cycle: 'MONTHLY' as const,
    default_payment_method: 'VISA',
    provider_website: 'https://manus.im',
    description: 'Agente IA autónomo para tareas complejas - Plan básico',
    notes: 'Agente IA que maneja tareas desde crear páginas web hasta automatizaciones complejas'
  },
  {
    name: 'Manus AI Pro',
    category: 'IA' as const,
    default_price: 199.00,
    default_billing_cycle: 'MONTHLY' as const,
    default_payment_method: 'VISA',
    provider_website: 'https://manus.im',
    description: 'Agente IA autónomo para tareas complejas - Plan profesional',
    notes: 'Plan avanzado con más capacidades y límites superiores para uso empresarial'
  },

  // Comunicación
  {
    name: 'Slack Pro',
    category: 'COMUNICACION' as const,
    default_price: 7.25,
    default_billing_cycle: 'MONTHLY' as const,
    default_payment_method: 'VISA',
    provider_website: 'https://slack.com',
    description: 'Plataforma de comunicación empresarial'
  },
  {
    name: 'Microsoft Teams Essentials',
    category: 'COMUNICACION' as const,
    default_price: 4.00,
    default_billing_cycle: 'MONTHLY' as const,
    default_payment_method: 'VISA',
    provider_website: 'https://www.microsoft.com/microsoft-teams',
    description: 'Solución de videoconferencias y colaboración para equipos'
  },
  {
    name: 'Nylas Starter',
    category: 'COMUNICACION' as const,
    default_price: 10.00,
    default_billing_cycle: 'MONTHLY' as const,
    default_payment_method: 'VISA',
    provider_website: 'https://nylas.com',
    description: 'API de email y calendario - Plan básico',
    notes: 'Base mensual + 5 cuentas conectadas incluidas, $1/cuenta adicional'
  },
  {
    name: 'Nylas Growth',
    category: 'COMUNICACION' as const,
    default_price: 15.00,
    default_billing_cycle: 'MONTHLY' as const,
    default_payment_method: 'VISA',
    provider_website: 'https://nylas.com',
    description: 'API de email y calendario - Plan crecimiento',
    notes: 'Base mensual + 5 cuentas conectadas incluidas, $1.50/cuenta adicional, funciones avanzadas'
  },
  {
    name: 'Resend Pro',
    category: 'COMUNICACION' as const,
    default_price: 20.00,
    default_billing_cycle: 'MONTHLY' as const,
    default_payment_method: 'VISA',
    provider_website: 'https://resend.com',
    description: 'API de email transaccional profesional',
    notes: 'Email API para desarrolladores, hasta 50,000 emails/mes'
  },
  {
    name: 'Pitch Pro',
    category: 'SOFTWARE' as const,
    default_price: 10.00,
    default_billing_cycle: 'MONTHLY' as const,
    default_payment_method: 'VISA',
    provider_website: 'https://pitch.com',
    description: 'Herramienta profesional de presentaciones colaborativas',
    notes: 'Presentaciones colaborativas con IA, plantillas premium, análisis avanzado'
  },

  // Diseño
  {
    name: 'Figma Pro',
    category: 'DISENO' as const,
    default_price: 12.00,
    default_billing_cycle: 'MONTHLY' as const,
    default_payment_method: 'VISA',
    provider_website: 'https://figma.com',
    description: 'Herramienta de diseño colaborativo profesional'
  },
  {
    name: 'Canva Pro',
    category: 'MARKETING' as const,
    default_price: 11.99,
    default_billing_cycle: 'MONTHLY' as const,
    default_payment_method: 'VISA',
    provider_website: 'https://canva.com',
    description: 'Plataforma de diseño gráfico profesional'
  },
  {
    name: 'Flowbase Pro+',
    category: 'DISENO' as const,
    default_price: 39.00,
    default_billing_cycle: 'MONTHLY' as const,
    default_payment_method: 'VISA',
    provider_website: 'https://flowbase.co',
    description: 'Librería premium de componentes y templates para Webflow'
  },

  // Software (ampliación)
  {
    name: 'GitHub Team',
    category: 'SOFTWARE' as const,
    default_price: 4.00,
    default_billing_cycle: 'MONTHLY' as const,
    default_payment_method: 'VISA',
    provider_website: 'https://github.com',
    description: 'Repositorios privados, PRs y automatizaciones con GitHub Actions'
  },
  {
    name: 'GitLab Premium',
    category: 'SOFTWARE' as const,
    default_price: 19.00,
    default_billing_cycle: 'MONTHLY' as const,
    default_payment_method: 'VISA',
    provider_website: 'https://gitlab.com',
    description: 'Gestión de ciclo de vida DevOps con repos, CI/CD y seguridad'
  },
  {
    name: 'Jira Software Standard',
    category: 'SOFTWARE' as const,
    default_price: 7.50,
    default_billing_cycle: 'MONTHLY' as const,
    default_payment_method: 'VISA',
    provider_website: 'https://www.atlassian.com/software/jira',
    description: 'Gestión de proyectos ágil para equipos de desarrollo'
  },
  {
    name: 'Confluence Standard',
    category: 'SOFTWARE' as const,
    default_price: 5.50,
    default_billing_cycle: 'MONTHLY' as const,
    default_payment_method: 'VISA',
    provider_website: 'https://www.atlassian.com/software/confluence',
    description: 'Wiki de documentación colaborativa para equipos'
  },
  {
    name: 'Linear Standard',
    category: 'SOFTWARE' as const,
    default_price: 8.00,
    default_billing_cycle: 'MONTHLY' as const,
    default_payment_method: 'VISA',
    provider_website: 'https://linear.app',
    description: 'Gestión de issues y roadmap enfocada a velocidad'
  },
  {
    name: 'ClickUp Business',
    category: 'SOFTWARE' as const,
    default_price: 9.00,
    default_billing_cycle: 'MONTHLY' as const,
    default_payment_method: 'VISA',
    provider_website: 'https://clickup.com',
    description: 'Gestión integral de tareas, docs y objetivos'
  },
  {
    name: 'Asana Premium',
    category: 'SOFTWARE' as const,
    default_price: 10.99,
    default_billing_cycle: 'MONTHLY' as const,
    default_payment_method: 'VISA',
    provider_website: 'https://asana.com',
    description: 'Planificación y seguimiento del trabajo en equipo'
  },
  {
    name: 'Trello Standard',
    category: 'SOFTWARE' as const,
    default_price: 5.00,
    default_billing_cycle: 'MONTHLY' as const,
    default_payment_method: 'VISA',
    provider_website: 'https://trello.com',
    description: 'Tableros Kanban simples y efectivos'
  },
  {
    name: 'Miro Business',
    category: 'SOFTWARE' as const,
    default_price: 16.00,
    default_billing_cycle: 'MONTHLY' as const,
    default_payment_method: 'VISA',
    provider_website: 'https://miro.com',
    description: 'Pizarras colaborativas para ideación y workshops'
  },
  {
    name: 'Loom Business',
    category: 'SOFTWARE' as const,
    default_price: 12.00,
    default_billing_cycle: 'MONTHLY' as const,
    default_payment_method: 'VISA',
    provider_website: 'https://loom.com',
    description: 'Grabación y compartición de vídeo para equipos'
  },
  {
    name: 'Airtable Team',
    category: 'SOFTWARE' as const,
    default_price: 20.00,
    default_billing_cycle: 'MONTHLY' as const,
    default_payment_method: 'VISA',
    provider_website: 'https://airtable.com',
    description: 'Base de datos + hojas de cálculo con vistas y automatizaciones'
  },
  {
    name: 'Postman Basic',
    category: 'SOFTWARE' as const,
    default_price: 14.00,
    default_billing_cycle: 'MONTHLY' as const,
    default_payment_method: 'VISA',
    provider_website: 'https://postman.com',
    description: 'Plataforma para diseñar, probar y documentar APIs'
  },
  {
    name: 'Vercel Pro',
    category: 'SOFTWARE' as const,
    default_price: 20.00,
    default_billing_cycle: 'MONTHLY' as const,
    default_payment_method: 'VISA',
    provider_website: 'https://vercel.com',
    description: 'Plataforma de despliegue frontend y edge',
    notes: 'Incluye funciones de equipo, preview deployments y ancho de banda adicional'
  },
  {
    name: 'Netlify Pro',
    category: 'SOFTWARE' as const,
    default_price: 19.00,
    default_billing_cycle: 'MONTHLY' as const,
    default_payment_method: 'VISA',
    provider_website: 'https://netlify.com',
    description: 'Despliegue y automatización para sitios JAMStack'
  },
  {
    name: 'Sentry Team',
    category: 'SOFTWARE' as const,
    default_price: 26.00,
    default_billing_cycle: 'MONTHLY' as const,
    default_payment_method: 'VISA',
    provider_website: 'https://sentry.io',
    description: 'Monitorización de errores y rendimiento',
    notes: 'Alertas, releases y performance para frontend y backend'
  },
  {
    name: 'JetBrains All Products',
    category: 'SOFTWARE' as const,
    default_price: 16.90,
    default_billing_cycle: 'MONTHLY' as const,
    default_payment_method: 'VISA',
    provider_website: 'https://www.jetbrains.com',
    description: 'Suite de IDEs profesionales para múltiples lenguajes'
  },
  {
    name: '1Password Business',
    category: 'SOFTWARE' as const,
    default_price: 7.99,
    default_billing_cycle: 'MONTHLY' as const,
    default_payment_method: 'VISA',
    provider_website: 'https://1password.com',
    description: 'Gestor de contraseñas y cofres seguros para equipos'
  },
  {
    name: 'Dropbox Business Standard',
    category: 'SOFTWARE' as const,
    default_price: 12.00,
    default_billing_cycle: 'MONTHLY' as const,
    default_payment_method: 'VISA',
    provider_website: 'https://dropbox.com',
    description: 'Almacenamiento y sincronización de archivos en la nube'
  }
]