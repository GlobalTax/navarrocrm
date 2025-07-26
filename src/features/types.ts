/**
 * Feature Module Types
 * 
 * Define la estructura estándar para todos los feature modules
 */

export interface FeatureModule {
  name: string
  version: string
  dependencies?: string[]
  permissions?: FeaturePermissions
  config?: FeatureConfig
}

export interface FeaturePermissions {
  read: string[]
  write: string[]
  admin: string[]
}

export interface FeatureConfig {
  enabled: boolean
  settings?: Record<string, any>
  experimental?: boolean
}

export interface FeatureComponent {
  displayName: string
  route?: string
  icon?: string
  description?: string
}

export interface FeatureHook {
  name: string
  type: 'data' | 'action' | 'ui'
  dependencies?: string[]
}

export interface FeatureService {
  name: string
  methods: string[]
  dalEntity?: string
}