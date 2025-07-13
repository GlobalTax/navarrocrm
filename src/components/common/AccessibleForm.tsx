import React, { useRef, useEffect } from 'react'
import { useAccessibility } from '@/hooks/useAccessibility'
import { useLogger } from '@/hooks/useLogger'

interface AccessibleFormProps {
  children: React.ReactNode
  onSubmit: (e: React.FormEvent) => void
  title: string
  description?: string
  className?: string
  autoFocus?: boolean
  validateOnBlur?: boolean
}

export const AccessibleForm: React.FC<AccessibleFormProps> = ({
  children,
  onSubmit,
  title,
  description,
  className = '',
  autoFocus = true,
  validateOnBlur = true
}) => {
  const formRef = useRef<HTMLFormElement>(null)
  const { trapFocus } = useAccessibility()
  const logger = useLogger('AccessibleForm')
  
  useEffect(() => {
    if (autoFocus && formRef.current) {
      const firstInput = formRef.current.querySelector('input, select, textarea') as HTMLElement
      firstInput?.focus()
      logger.debug('Form auto-focused', { title })
    }
  }, [autoFocus, title, logger])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate all required fields
    const form = formRef.current
    if (!form) return
    
    const requiredFields = form.querySelectorAll('[required]') as NodeListOf<HTMLInputElement>
    const invalidFields: HTMLElement[] = []
    
    requiredFields.forEach(field => {
      if (!field.value.trim()) {
        invalidFields.push(field)
        field.setAttribute('aria-invalid', 'true')
      } else {
        field.setAttribute('aria-invalid', 'false')
      }
    })
    
    if (invalidFields.length > 0) {
      // Focus first invalid field
      invalidFields[0].focus()
      
      // Announce error to screen readers
      const errorMessage = `Hay ${invalidFields.length} campos requeridos sin completar`
      const announcement = document.createElement('div')
      announcement.setAttribute('aria-live', 'assertive')
      announcement.setAttribute('aria-atomic', 'true')
      announcement.className = 'sr-only'
      announcement.textContent = errorMessage
      
      document.body.appendChild(announcement)
      setTimeout(() => document.body.removeChild(announcement), 3000)
      
      logger.warn('Form validation failed', { 
        invalidFieldsCount: invalidFields.length,
        title 
      })
      return
    }
    
    logger.info('Form submitted successfully', { title })
    onSubmit(e)
  }

  const handleFieldBlur = (e: React.FocusEvent) => {
    if (!validateOnBlur) return
    
    const field = e.target as HTMLInputElement
    if (field.required && !field.value.trim()) {
      field.setAttribute('aria-invalid', 'true')
    } else {
      field.setAttribute('aria-invalid', 'false')
    }
  }

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      onBlur={handleFieldBlur}
      className={`accessible-form ${className}`}
      role="form"
      aria-labelledby="form-title"
      aria-describedby={description ? "form-description" : undefined}
      noValidate
    >
      <div className="sr-only">
        <h2 id="form-title">{title}</h2>
        {description && <p id="form-description">{description}</p>}
      </div>
      
      {children}
      
      <style>{`
        .accessible-form [aria-invalid="true"] {
          border-color: hsl(var(--destructive));
          box-shadow: 0 0 0 2px hsl(var(--destructive) / 0.2);
        }
        
        .accessible-form [required]::after {
          content: "*";
          color: hsl(var(--destructive));
          margin-left: 0.25rem;
        }
      `}</style>
    </form>
  )
}