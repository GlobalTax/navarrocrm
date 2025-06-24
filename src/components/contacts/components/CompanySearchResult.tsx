
import React from 'react'
import { Building2, CheckCircle2, TestTube, AlertTriangle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import type { CompanyData } from '@/hooks/useCompanyLookup'

interface CompanySearchResultProps {
  result: CompanyData & { isSimulated?: boolean, warning?: string }
}

export const CompanySearchResult = ({ result }: CompanySearchResultProps) => {
  const getResultAlertStyle = () => {
    if (result.warning) {
      return { className: 'border-orange-200 bg-orange-50' }
    } else if (result.isSimulated) {
      return { className: 'border-blue-200 bg-blue-50' }
    } else {
      return { className: 'border-green-200 bg-green-50' }
    }
  }

  const getResultIcon = () => {
    if (result.warning) {
      return AlertTriangle
    } else if (result.isSimulated) {
      return TestTube
    } else {
      return CheckCircle2
    }
  }

  const getResultIconColor = () => {
    if (result.warning) {
      return 'text-orange-600'
    } else if (result.isSimulated) {
      return 'text-blue-600'
    } else {
      return 'text-green-600'
    }
  }

  const getResultTextColor = () => {
    if (result.warning) {
      return 'text-orange-800'
    } else if (result.isSimulated) {
      return 'text-blue-800'
    } else {
      return 'text-green-800'
    }
  }

  const getStatusMessage = () => {
    if (result.warning) {
      return result.warning
    } else if (result.isSimulated) {
      return 'Datos de prueba para desarrollo'
    } else {
      return 'Datos oficiales del Registro Mercantil cargados correctamente'
    }
  }

  const ResultIcon = getResultIcon()

  return (
    <Alert {...getResultAlertStyle()}>
      <ResultIcon className={`h-4 w-4 ${getResultIconColor()}`} />
      <AlertDescription className={getResultTextColor()}>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <div className={`font-semibold ${getResultTextColor().replace('800', '900')} flex items-center gap-2`}>
                {result.name}
                {result.isSimulated && (
                  <Badge variant="outline" className={`text-xs ${
                    result.warning 
                      ? 'bg-orange-50 border-orange-200 text-orange-700'
                      : 'bg-blue-50 border-blue-200 text-blue-700'
                  }`}>
                    <TestTube className="h-3 w-3 mr-1" />
                    {result.warning ? 'Datos de prueba' : 'Desarrollo'}
                  </Badge>
                )}
                {!result.isSimulated && (
                  <Badge variant="outline" className="text-xs bg-green-50 border-green-200 text-green-700">
                    ✓ Oficial
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <Building2 className="h-3 w-3" />
                <span className="text-xs font-mono">{result.nif}</span>
                <Badge 
                  variant={result.status === 'activo' ? 'default' : 'secondary'}
                  className="text-xs"
                >
                  {result.status === 'activo' ? 'Activa' : 'Inactiva'}
                </Badge>
              </div>
            </div>
          </div>
          
          {result.address_street && (
            <div className={`text-xs ${getResultTextColor().replace('800', '700')}`}>
              📍 {result.address_street}
              {result.address_city && `, ${result.address_city}`}
              {result.address_postal_code && ` ${result.address_postal_code}`}
            </div>
          )}
          
          {result.business_sector && (
            <div className={`text-xs ${getResultTextColor().replace('800', '700')}`}>
              🏢 {result.business_sector}
            </div>
          )}
          
          <div className={`text-xs ${getResultTextColor().replace('800', '700')} font-medium`}>
            {result.warning ? '⚠️' : result.isSimulated ? 'ℹ️' : '✅'} {getStatusMessage()}
          </div>
        </div>
      </AlertDescription>
    </Alert>
  )
}
