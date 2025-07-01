
import { useState } from 'react'
import { ProposalFormData } from '@/modules/proposals/types/proposal.schema'
import { useProposalActions } from '@/hooks/proposals/useProposalActions'

interface ProposalsPageHandlersProps {
  updateProposalStatus: any
  saveRecurrentProposal: any
  user: any
  closeRecurrentBuilder: () => void
}

export const useProposalsPageHandlers = ({
  updateProposalStatus,
  saveRecurrentProposal,
  user,
  closeRecurrentBuilder,
}: ProposalsPageHandlersProps) => {
  const [selectedProposal, setSelectedProposal] = useState<any>(null)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean
    title: string
    description: string
    onConfirm: () => void
    variant?: 'default' | 'destructive'
  }>({
    isOpen: false,
    title: '',
    description: '',
    onConfirm: () => {},
    variant: 'default'
  })

  const { duplicateProposal, updateProposalStatus: updateStatus } = useProposalActions()
  
  const handleStatusChange = (id: string, status: any) => {
    const proposal = selectedProposal || { id, status: 'draft' }
    
    // Mostrar confirmación para cambios importantes
    const getConfirmationConfig = (newStatus: string) => {
      switch (newStatus) {
        case 'won':
          return {
            title: 'Confirmar propuesta ganada',
            description: `¿Estás seguro de marcar esta propuesta como ganada? ${
              proposal.is_recurring 
                ? 'Esto creará automáticamente una cuota recurrente.' 
                : 'Esto creará automáticamente un expediente.'
            }`,
            variant: 'default' as const
          }
        case 'lost':
          return {
            title: 'Confirmar propuesta perdida',
            description: '¿Estás seguro de marcar esta propuesta como perdida? Esta acción se puede revertir.',
            variant: 'destructive' as const
          }
        default:
          return null
      }
    }

    const confirmConfig = getConfirmationConfig(status)
    
    if (confirmConfig) {
      setConfirmDialog({
        isOpen: true,
        title: confirmConfig.title,
        description: confirmConfig.description,
        variant: confirmConfig.variant,
        onConfirm: () => {
          updateProposalStatus.mutate({ id, status })
          setConfirmDialog(prev => ({ ...prev, isOpen: false }))
        }
      })
    } else {
      updateProposalStatus.mutate({ id, status })
    }
  }

  const handleViewProposal = (proposal: any) => {
    console.log('Ver propuesta:', proposal)
    setSelectedProposal(proposal)
    setIsDetailDialogOpen(true)
  }

  const handleEditProposal = (proposal: any) => {
    console.log('Editar propuesta:', proposal)
    // TODO: Implementar apertura del formulario de edición
    // Por ahora, mostrar mensaje informativo
    alert('Funcionalidad de edición en desarrollo. Próximamente disponible.')
  }

  const handleDuplicateProposal = async (proposal: any) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Duplicar propuesta',
      description: `¿Estás seguro de duplicar "${proposal.title}"? Se creará una copia en estado borrador.`,
      onConfirm: async () => {
        try {
          await duplicateProposal(proposal)
          setConfirmDialog(prev => ({ ...prev, isOpen: false }))
        } catch (error) {
          // Error ya manejado en el hook
        }
      }
    })
  }

  const handleDetailStatusChange = async (id: string, status: string) => {
    const currentProposal = selectedProposal
    if (!currentProposal) return

    const success = await updateStatus(id, currentProposal.status, status)
    if (success) {
      // Actualizar el estado local del proposal seleccionado
      setSelectedProposal(prev => prev ? { ...prev, status } : null)
    }
  }

  const handleSaveRecurrentProposal = (data: ProposalFormData) => {
    console.log('Handling save recurrent proposal:', data)
    
    // Validación de seguridad - verificar que el usuario esté disponible
    if (!user || !user.org_id) {
      console.error("User o org_id no está disponible. No se puede guardar la propuesta.")
      return
    }
    
    // Preparar datos de propuesta recurrente
    const recurrentProposalData: ProposalFormData = {
      ...data,
      is_recurring: true,
      recurring_frequency: data.recurring_frequency || 'monthly',
    }
    
    console.log('Pasando datos directamente al hook:', recurrentProposalData)
    
    // Pasar datos directamente al hook - sin wrapper
    saveRecurrentProposal(recurrentProposalData)
    closeRecurrentBuilder()
  }

  const closeDetailDialog = () => {
    setIsDetailDialogOpen(false)
    setSelectedProposal(null)
  }

  const closeConfirmDialog = () => {
    setConfirmDialog(prev => ({ ...prev, isOpen: false }))
  }

  return {
    // Handlers originales
    handleStatusChange,
    handleViewProposal,
    handleSaveRecurrentProposal,
    
    // Nuevos handlers
    handleEditProposal,
    handleDuplicateProposal,
    handleDetailStatusChange,
    
    // Estados para diálogos
    selectedProposal,
    isDetailDialogOpen,
    confirmDialog,
    
    // Handlers para cerrar diálogos
    closeDetailDialog,
    closeConfirmDialog
  }
}
