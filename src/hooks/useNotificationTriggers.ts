
import { useCallback } from 'react'
import { useGlobalStateContext } from '@/contexts/GlobalStateContext'

export const useNotificationTriggers = () => {
  const { addNotification } = useGlobalStateContext()

  // Notificaciones de éxito para operaciones CRUD
  const notifySuccess = useCallback((title: string, message: string, action?: { label: string; onClick: () => void }) => {
    addNotification({
      type: 'success',
      title,
      message,
      action,
      autoClose: true,
      duration: 4000
    })
  }, [addNotification])

  // Notificaciones de error con acciones de recuperación
  const notifyError = useCallback((title: string, message: string, action?: { label: string; onClick: () => void }) => {
    addNotification({
      type: 'error',
      title,
      message,
      action,
      persistent: true,
      autoClose: false
    })
  }, [addNotification])

  // Notificaciones de advertencia
  const notifyWarning = useCallback((title: string, message: string, action?: { label: string; onClick: () => void }) => {
    addNotification({
      type: 'warning',
      title,
      message,
      action,
      autoClose: true,
      duration: 6000
    })
  }, [addNotification])

  // Notificaciones informativas
  const notifyInfo = useCallback((title: string, message: string, action?: { label: string; onClick: () => void }) => {
    addNotification({
      type: 'info',
      title,
      message,
      action,
      autoClose: true,
      duration: 5000
    })
  }, [addNotification])

  // Notificaciones específicas del dominio
  const notifyTaskCompleted = useCallback((taskTitle: string, taskId: string) => {
    addNotification({
      type: 'success',
      title: 'Tarea Completada',
      message: `"${taskTitle}" ha sido marcada como completada`,
      action: {
        label: 'Ver Tarea',
        onClick: () => {
          // Navegar a la tarea o abrir modal
          console.log('Navigate to task:', taskId)
        }
      },
      autoClose: true,
      duration: 5000
    })
  }, [addNotification])

  const notifyProposalStatusChange = useCallback((proposalTitle: string, newStatus: string, proposalId: string) => {
    addNotification({
      type: 'info',
      title: 'Propuesta Actualizada',
      message: `"${proposalTitle}" cambió a estado: ${newStatus}`,
      action: {
        label: 'Ver Propuesta',
        onClick: () => {
          // Navegar a la propuesta
          console.log('Navigate to proposal:', proposalId)
        }
      },
      autoClose: true,
      duration: 6000
    })
  }, [addNotification])

  const notifyClientCommunication = useCallback((clientName: string, type: 'email' | 'call' | 'meeting', clientId: string) => {
    const typeLabels = {
      email: 'Nuevo Email',
      call: 'Llamada Pendiente',
      meeting: 'Reunión Programada'
    }
    
    addNotification({
      type: 'info',
      title: typeLabels[type],
      message: `Actividad de comunicación con ${clientName}`,
      action: {
        label: 'Ver Cliente',
        onClick: () => {
          // Navegar al cliente
          console.log('Navigate to client:', clientId)
        }
      },
      autoClose: true,
      duration: 7000
    })
  }, [addNotification])

  const notifySystemMaintenance = useCallback((message: string, startTime: Date) => {
    addNotification({
      type: 'warning',
      title: 'Mantenimiento Programado',
      message: `${message} - Inicio: ${startTime.toLocaleString('es-ES')}`,
      persistent: true,
      autoClose: false
    })
  }, [addNotification])

  const notifyDeadlineReminder = useCallback((title: string, deadline: Date, itemId: string, itemType: 'task' | 'case' | 'proposal') => {
    const typeLabels = {
      task: 'Tarea',
      case: 'Caso',
      proposal: 'Propuesta'
    }
    
    addNotification({
      type: 'warning',
      title: `${typeLabels[itemType]} Próxima a Vencer`,
      message: `"${title}" vence el ${deadline.toLocaleDateString('es-ES')}`,
      action: {
        label: `Ver ${typeLabels[itemType]}`,
        onClick: () => {
          console.log(`Navigate to ${itemType}:`, itemId)
        }
      },
      persistent: true,
      autoClose: false
    })
  }, [addNotification])

  return {
    notifySuccess,
    notifyError,
    notifyWarning,
    notifyInfo,
    notifyTaskCompleted,
    notifyProposalStatusChange,
    notifyClientCommunication,
    notifySystemMaintenance,
    notifyDeadlineReminder
  }
}
