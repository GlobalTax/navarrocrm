
import { toast } from 'sonner'

export const getErrorMessage = (errorCode: string, message?: string): string => {
  switch (errorCode) {
    case 'INVALID_CREDENTIALS':
      return 'Las credenciales de eInforma no son válidas. Contacta con el administrador del sistema.'
    case 'CREDENTIALS_MISSING':
      return 'Las credenciales de eInforma no están configuradas. Contacta con el administrador del sistema.'
    case 'COMPANY_NOT_FOUND':
      return 'No se encontró ninguna empresa con este NIF/CIF en el Registro Mercantil'
    case 'INVALID_FORMAT':
      return 'El formato del NIF/CIF no es válido'
    case 'RATE_LIMIT_EXCEEDED':
      return 'Se ha excedido el límite de consultas. Inténtalo de nuevo en unos minutos.'
    case 'SERVICE_UNAVAILABLE':
      return 'El servicio de consulta no está disponible temporalmente. Inténtalo más tarde.'
    case 'TIMEOUT':
      return 'La consulta ha tardado demasiado. Inténtalo de nuevo.'
    default:
      return message || 'Error al consultar los datos empresariales'
  }
}

export const showSuccessToast = (data: any, isSimulated?: boolean, warning?: string) => {
  const toastMessage = `${data.name} - ${data.nif}`
  
  if (isSimulated) {
    if (warning) {
      toast.warning('Empresa encontrada (datos de prueba)', {
        description: `${toastMessage} - ${warning}`
      })
    } else {
      toast.info('Empresa encontrada (datos de prueba)', {
        description: `${toastMessage} - Datos de prueba para desarrollo`
      })
    }
  } else {
    toast.success('Empresa encontrada', {
      description: `${toastMessage} - Datos oficiales del Registro Mercantil`
    })
  }
}

export const handleNetworkError = (error: Error): string => {
  if (error.message.includes('fetch')) {
    return 'Error de conexión. Verifica tu conexión a internet e inténtalo de nuevo.'
  } else if (error.message.includes('timeout')) {
    return 'La consulta ha tardado demasiado. Inténtalo de nuevo.'
  } else if (!error.message.includes('credenciales') && !error.message.includes('encontró')) {
    return error.message
  }
  return 'Error inesperado al buscar la empresa'
}
