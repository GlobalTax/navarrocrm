
import React from 'react'
import { Search, AlertCircle, Loader2 } from 'lucide-react'
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
  return (
    <div className="flex gap-2">
      <div className="flex-1">
        <Input
          placeholder="Introduce NIF/CIF (ej: B12345678, 12345678Z, X1234567L)"
          value={nif}
          onChange={(e) => onNifChange(e.target.value)}
          onKeyPress={onKeyPress}
          disabled={disabled || isLoading}
          className={`font-mono ${
            searchError || (nif && !isValidFormat(nif)) 
              ? 'border-red-300 focus:border-red-500' 
              : ''
          }`}
        />
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
