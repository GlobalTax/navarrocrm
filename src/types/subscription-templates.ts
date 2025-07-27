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
    name: 'Slack Pro',
    category: 'COMUNICACION' as const,
    default_price: 7.25,
    default_billing_cycle: 'MONTHLY' as const,
    default_payment_method: 'VISA',
    provider_website: 'https://slack.com',
    description: 'Plataforma de comunicación empresarial'
  }
]