import React from 'react'
import { cn } from '@/lib/utils'

interface SkipLinkProps {
  href: string
  children: React.ReactNode
  className?: string
}

export const SkipLink = ({ href, children, className }: SkipLinkProps) => {
  return (
    <a
      href={href}
      className={cn(
        // Posicionamiento
        "absolute left-1/2 top-0 z-50 -translate-x-1/2 transform",
        // Visibilidad - invisible hasta focus
        "pointer-events-none opacity-0 translate-y-[-100%]",
        // Estados focus/active - visible cuando focused
        "focus:pointer-events-auto focus:opacity-100 focus:translate-y-0",
        // Estilos visuales
        "bg-primary text-primary-foreground",
        "border border-foreground rounded-[10px]",
        "px-4 py-2 text-sm font-medium",
        "shadow-lg transition-all duration-200",
        // Accesibilidad
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        className
      )}
      onFocus={(e) => {
        // Asegurar que el elemento sea visible inmediatamente al hacer focus
        e.currentTarget.style.transform = 'translateX(-50%) translateY(0)'
      }}
      onBlur={(e) => {
        // Ocultar cuando pierde el focus
        e.currentTarget.style.transform = 'translateX(-50%) translateY(-100%)'
      }}
    >
      {children}
    </a>
  )
}