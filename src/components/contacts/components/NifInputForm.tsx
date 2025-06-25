
import React from 'react'
import { Search, AlertCircle, Loader2, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface NifInputFormProps {
  nif: string
  onNifChange: (value: string) => void
  onSearch: () => void
  onKeyPress: (e: React.KeyboardEvent) => void
  isLoading: boolean
  disabled: boolean
  isValidFormat: (nif: string) => boolean
  validationMessage: string | null
  searchError: string | null
}

export const NifInputForm = ({
  nif,
  onNifChange,
  onSearch,
  onKeyPress,
  isLoading,
  disabled,
  isValidFormat,
  validationMessage,
  searchError
}: NifInputFormProps) => {
  // Determinar estado visual mejorado
  const getInputState = () => {
    if (!nif) return 'default'
    if (searchError) return 'error'
    if (validationMessage) return 'warning'
    if (isValidFormat(nif)) return 'success'
    return 'warning'
  }

  const inputState = getInputState()
  
  // Clases CSS mejoradas para mejor feedback visual
  const getInputClasses = () => {
    const baseClasses = 'font-mono transition-colors duration-200'
    
    switch (inputState) {
      case 'error':
        return `${baseClasses} border-red-300 focus:border-red-500 bg-red-50`
      case 'warning':
        return `${baseClasses} border-orange-300 focus:border-orange-500 bg-orange-50`
      case 'success':
        return `${baseClasses} border-green-300 focus:border-green-500 bg-green-50`
      default:
        return baseClasses
    }
  }

  // Icono de estado mejorado
  const getStatusIcon = () => {
    if (!nif) return null
    
    switch (inputState) {
      case 'success':
        return <CheckCircle className="h-3 w-3 text-green-600" />
      case 'error':
      case 'warning':
        return <AlertCircle className="h-3 w-3 text-orange-600" />
      default:
        return null
    }
  }

  return (
    <div className="flex gap-2">
      <div className="flex-1">
        <div className="relative">
          <Input
            placeholder="Introduce NIF/CIF (ej: B12345678, 12345678Z, X1234567L)"
            value={nif}
            onChange={(e) => onNifChange(e.target.value)}
            onKeyPress={onKeyPress}
            disabled={disabled || isLoading}
            className={getInputClasses()}
            maxLength={9}
          />
          {getStatusIcon() && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              {getStatusIcon()}
            </div>
          )}
        </div>
        
        {/* Mensajes de validación mejorados */}
        {validationMessage && (
          <p className="text-xs text-orange-600 mt-1 flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            {validationMessage}
          </p>
        )}
        
        {searchError && (
          <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            {searchError}
          </p>
        )}
        
        {/* Indicador de progreso para entrada parcial */}
        {nif && !validationMessage && !searchError && !isValidFormat(nif) && nif.length < 8 && (
          <p className="text-xs text-gray-500 mt-1">
            {nif.length}/8-9 caracteres
          </p>
        )}
      </div>
      
      <Button
        type="button"
        variant="outline"
        onClick={onSearch}
        disabled={!nif || !isValidFormat(nif) || isLoading || disabled}
        className="shrink-0"
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Search className="h-4 w-4" />
        )}
        {isLoading ? 'Buscando...' : 'Buscar'}
      </Button>
    </div>
  )
}
