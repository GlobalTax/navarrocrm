
import { useEffect } from 'react'
import { UseFormReturn } from 'react-hook-form'
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Loader2, CheckCircle, XCircle } from 'lucide-react'
import { useUniqueFieldValidation } from '@/hooks/shared/useUniqueFieldValidation'
import { cn } from '@/lib/utils'

interface UniqueFieldProps {
  form: UseFormReturn<any>
  name: string
  label: string
  placeholder?: string
  tableName: string
  currentId?: string
  type?: 'text' | 'email'
  required?: boolean
  customMessage?: string
  disabled?: boolean
}

export const UniqueField = ({
  form,
  name,
  label,
  placeholder,
  tableName,
  currentId,
  type = 'text',
  required = false,
  customMessage,
  disabled = false
}: UniqueFieldProps) => {
  const fieldValue = form.watch(name)
  
  const { isValid, isChecking, error, checkUniqueness } = useUniqueFieldValidation({
    fieldName: name,
    tableName,
    currentId,
    customMessage,
    enabled: !disabled
  })

  // Trigger validation when field value changes
  useEffect(() => {
    if (fieldValue && !disabled) {
      checkUniqueness(fieldValue)
    }
  }, [fieldValue, checkUniqueness, disabled])

  // Set form error when validation fails
  useEffect(() => {
    if (error && !isChecking) {
      form.setError(name, { message: error })
    } else if (isValid && !isChecking) {
      form.clearErrors(name)
    }
  }, [error, isValid, isChecking, form, name])

  const getStatusIcon = () => {
    if (isChecking) {
      return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
    }
    if (fieldValue && !isChecking) {
      return isValid ? (
        <CheckCircle className="h-4 w-4 text-green-500" />
      ) : (
        <XCircle className="h-4 w-4 text-red-500" />
      )
    }
    return null
  }

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </FormLabel>
          <FormControl>
            <div className="relative">
              <Input
                {...field}
                type={type}
                placeholder={placeholder}
                disabled={disabled}
                className={cn(
                  "pr-10",
                  !isValid && !isChecking && "border-red-300 focus:border-red-500",
                  isValid && fieldValue && !isChecking && "border-green-300 focus:border-green-500"
                )}
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                {getStatusIcon()}
              </div>
            </div>
          </FormControl>
          <FormMessage />
          {isChecking && (
            <p className="text-sm text-blue-600 flex items-center gap-1">
              <Loader2 className="h-3 w-3 animate-spin" />
              Verificando disponibilidad...
            </p>
          )}
        </FormItem>
      )}
    />
  )
}
