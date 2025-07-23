
import { ReactNode } from 'react'

export interface RouteConfig {
  path: string
  element: ReactNode
  children?: RouteConfig[]
}

export interface RouteModule {
  routes: RouteConfig[]
  basePath?: string
}
