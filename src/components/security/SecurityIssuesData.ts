
// Datos reales de problemas de seguridad identificados por el linter de Supabase
export interface SecurityIssueReal {
  name: string
  title: string
  level: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'WARN'
  facing: 'INTERNAL' | 'EXTERNAL'
  categories: string[]
  description: string
  detail: string
  remediation: string
  metadata: Record<string, any>
  cache_key: string
}

export const REAL_SECURITY_ISSUES: SecurityIssueReal[] = [
  {
    name: 'materialized_view_in_api',
    title: 'Vista Materializada - copia_empresas_hubspot',
    level: 'WARN',
    facing: 'EXTERNAL',
    categories: ['SECURITY'],
    description: 'Vista materializada accesible por roles anon/authenticated',
    detail: 'Materialized view `public.copia_empresas_hubspot` is selectable by anon or authenticated roles',
    remediation: 'https://supabase.com/docs/guides/database/database-linter?lint=0016_materialized_view_in_api',
    metadata: { name: 'copia_empresas_hubspot', type: 'materialized view', schema: 'public' },
    cache_key: 'materialized_view_in_api_public_copia_empresas_hubspot'
  },
  {
    name: 'materialized_view_in_api',
    title: 'Vista Materializada - copia_contactos_hubspot',
    level: 'WARN',
    facing: 'EXTERNAL',
    categories: ['SECURITY'],
    description: 'Vista materializada accesible por roles anon/authenticated',
    detail: 'Materialized view `public.copia_contactos_hubspot` is selectable by anon or authenticated roles',
    remediation: 'https://supabase.com/docs/guides/database/database-linter?lint=0016_materialized_view_in_api',
    metadata: { name: 'copia_contactos_hubspot', type: 'materialized view', schema: 'public' },
    cache_key: 'materialized_view_in_api_public_copia_contactos_hubspot'
  },
  {
    name: 'foreign_table_in_api',
    title: 'Tablas Foráneas HubSpot (5 tablas)',
    level: 'WARN',
    facing: 'EXTERNAL',
    categories: ['SECURITY'],
    description: '5 tablas foráneas de HubSpot expuestas en la API sin RLS',
    detail: 'Foreign tables: Contacts hubspot, hubspot_contacts, hubspot_companies, hubspot_deals, CRM hubspot companies are accessible over APIs',
    remediation: 'https://supabase.com/docs/guides/database/database-linter?lint=0017_foreign_table_in_api',
    metadata: { count: 5, type: 'foreign tables', integration: 'hubspot' },
    cache_key: 'foreign_table_in_api_hubspot_tables'
  },
  {
    name: 'auth_otp_long_expiry',
    title: 'OTP Expiry Demasiado Largo',
    level: 'WARN',
    facing: 'EXTERNAL',
    categories: ['SECURITY'],
    description: 'Expiración de OTP configurada a más de una hora',
    detail: 'Email provider OTP expiry is set to more than an hour. Recommended to set this value to less than an hour.',
    remediation: 'https://supabase.com/docs/guides/platform/going-into-prod#security',
    metadata: { type: 'auth', entity: 'Auth' },
    cache_key: 'auth_otp_long_expiry'
  },
  {
    name: 'auth_leaked_password_protection',
    title: 'Protección Contraseñas Comprometidas Deshabilitada',
    level: 'WARN',
    facing: 'EXTERNAL',
    categories: ['SECURITY'],
    description: 'Protección contra contraseñas comprometidas deshabilitada',
    detail: 'Supabase Auth prevents the use of compromised passwords by checking against HaveIBeenPwned.org. Enable this feature to enhance security.',
    remediation: 'https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection',
    metadata: { type: 'auth', entity: 'Auth' },
    cache_key: 'auth_leaked_password_protection'
  }
]

export const RESOLVED_CRITICAL_ISSUES = [
  'Function Search Path - identify_churn_risk_clients',
  'Function Search Path - get_historical_revenue', 
  'Function Search Path - update_analytics_sessions_updated_at',
  'Function Search Path - update_updated_at_column',
  'Function Search Path - calculate_productivity_metrics'
]
