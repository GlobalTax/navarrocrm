import React, { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { CheckCircle, AlertCircle, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface FormFieldProps {
  id: string
  label: string
  type?: 'text' | 'email' | 'tel' | 'date' | 'textarea' | 'password'
  value: string
  onChange: (value: string) => void
  onBlur?: () => void
  error?: string
  touched?: boolean
  required?: boolean
  placeholder?: string
  hint?: string
  className?: string
  rows?: number
  maxLength?: number
  autoComplete?: string
  formatValue?: (value: string) => string
  validateOnChange?: boolean
}

export function FormField({
  id,
  label,
  type = 'text',
  value,
  onChange,
  onBlur,
  error,
  touched = false,
  required = false,
  placeholder,
  hint,
  className = '',
  rows = 3,
  maxLength,
  autoComplete,
  formatValue,
  validateOnChange = true
}: FormFieldProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [isFocused, setIsFocused] = useState(false)

  const hasError = touched && error
  const isValid = touched && !error && value.length > 0

  const handleChange = (newValue: string) => {
    let processedValue = newValue
    
    // Apply formatting if provided
    if (formatValue) {
      processedValue = formatValue(newValue)
    }
    
    onChange(processedValue)
  }

  const inputType = type === 'password' ? (showPassword ? 'text' : 'password') : type

  const baseInputClasses = `
    border-0.5 rounded-[10px] transition-all duration-200
    ${hasError ? 'border-red-500 bg-red-50 focus:border-red-500 focus:ring-red-500/20' : ''}
    ${isValid ? 'border-green-500 bg-green-50 focus:border-green-500 focus:ring-green-500/20' : ''}
    ${!hasError && !isValid ? 'border-gray-300 focus:border-blue-500 focus:ring-blue-500/20' : ''}
    ${isFocused ? 'shadow-sm scale-[1.01]' : ''}
  `

  const renderInput = () => {
    const commonProps = {
      id,
      value,
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => 
        handleChange(e.target.value),
      onBlur: () => {
        setIsFocused(false)
        onBlur?.()
      },
      onFocus: () => setIsFocused(true),
      placeholder,
      className: `${baseInputClasses} ${className}`,
      maxLength,
      autoComplete,
      required
    }

    if (type === 'textarea') {
      return (
        <Textarea
          {...commonProps}
          rows={rows}
        />
      )
    }

    return (
      <div className="relative">
        <Input
          {...commonProps}
          type={inputType}
        />
        {type === 'password' && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0 hover:bg-transparent"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4 text-gray-500" />
            ) : (
              <Eye className="h-4 w-4 text-gray-500" />
            )}
          </Button>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Label 
          htmlFor={id} 
          className={`text-sm font-medium ${hasError ? 'text-red-700' : 'text-gray-700'}`}
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
        
        {isValid && (
          <CheckCircle className="h-4 w-4 text-green-600" />
        )}
        
        {hasError && (
          <AlertCircle className="h-4 w-4 text-red-600" />
        )}
      </div>

      {renderInput()}

      {/* Contador de caracteres */}
      {maxLength && (
        <div className="flex justify-end">
          <span className={`text-xs ${value.length > maxLength * 0.9 ? 'text-orange-600' : 'text-gray-500'}`}>
            {value.length}/{maxLength}
          </span>
        </div>
      )}

      {/* Error message */}
      {hasError && (
        <p className="text-sm text-red-600 flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          {error}
        </p>
      )}

      {/* Hint message */}
      {hint && !hasError && (
        <p className="text-sm text-gray-500">{hint}</p>
      )}
    </div>
  )
}

// Formatters for common field types
export const FieldFormatters = {
  phone: (value: string) => {
    // Format phone number: +34 600 000 000
    const cleaned = value.replace(/\D/g, '')
    if (cleaned.startsWith('34')) {
      const number = cleaned.slice(2)
      return `+34 ${number.slice(0, 3)} ${number.slice(3, 6)} ${number.slice(6, 9)}`
    }
    if (cleaned.length <= 9) {
      return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6, 9)}`
    }
    return value
  },

  iban: (value: string) => {
    // Format IBAN: ES00 0000 0000 0000 0000 0000
    const cleaned = value.replace(/\s/g, '').toUpperCase()
    return cleaned.replace(/(.{4})/g, '$1 ').trim()
  },

  dni: (value: string) => {
    // Format DNI/NIE: 12345678X
    return value.toUpperCase().replace(/[^0-9TRWAGMYFPDXBNJZSQVHLCKEXYZ]/g, '')
  }
}