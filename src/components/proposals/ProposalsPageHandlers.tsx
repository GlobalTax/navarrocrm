
import { useState } from 'react'
import type { ProposalFormData } from '@/types/proposals/forms'
import { useProposalActions } from '@/hooks/proposals/useProposalActions'
import { useOnboarding } from '@/contexts/OnboardingContext'

interface ProposalsPageHandlersProps {
  updateProposalStatus: any
  saveRecurrentProposal: any
  user: any
  closeRecurrentBuilder: () => void
  openEditProposal?: (proposal: any) => void // Nueva función para abrir editor
}

export const useProposalsPageHandlers = ({
  updateProposalStatus,
  saveRecurrentProposal,
  user,
  closeRecurrentBuilder,
  openEditProposal,
}: ProposalsPageHandlersProps) => {
  const [selectedProposal, setSelectedProposal] = useState<any>(null)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)
  const [onboardingDialog, setOnboardingDialog] = useState<{
    isOpen: boolean
    proposal: any
  }>({
    isOpen: false,
    proposal: null
  })

  const { startOnboardingFromProposal } = useOnboarding()
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

  const { duplicateProposal, deleteProposal, updateProposalStatus: updateStatus } = useProposalActions()
  
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
    // Abrir el formulario correcto en modo edición usando el nuevo estado
    // Esta funcionalidad será manejada por el componente padre que pasará openEditProposal
    if (typeof openEditProposal === 'function') {
      openEditProposal(proposal)
    } else {
      alert('Funcionalidad de edición no disponible. Asegúrate de pasar openEditProposal como prop.')
    }
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

  const handleProposalWon = (proposal: any) => {
    // Mostrar diálogo de confirmación de onboarding
    setOnboardingDialog({
      isOpen: true,
      proposal
    })
  }

  const handleStartOnboarding = async () => {
    if (onboardingDialog.proposal) {
      await startOnboardingFromProposal(onboardingDialog.proposal)
      setOnboardingDialog({ isOpen: false, proposal: null })
    }
  }

  const closeOnboardingDialog = () => {
    setOnboardingDialog({ isOpen: false, proposal: null })
  }

  const handleDeleteProposal = (proposal: any) => {
    setConfirmDialog({
      isOpen: true,
      title: '¿Eliminar propuesta?',
      description: `¿Estás seguro de eliminar "${proposal.title}"? Esta acción no se puede deshacer.`,
      variant: 'destructive',
      onConfirm: async () => {
        try {
          await deleteProposal(proposal.id, proposal.title)
          setConfirmDialog(prev => ({ ...prev, isOpen: false }))
        } catch (error) {
          // Error ya manejado en el hook
        }
      }
    })
  }

  return {
    // Handlers originales
    handleStatusChange,
    handleViewProposal,
    handleSaveRecurrentProposal,
    
    // Nuevos handlers
    handleEditProposal,
    handleDuplicateProposal,
    handleDeleteProposal,
    handleDetailStatusChange,
    handleProposalWon,
    
    // Estados para diálogos
    selectedProposal,
    isDetailDialogOpen,
    confirmDialog,
    onboardingDialog,
    
    // Handlers para cerrar diálogos
    closeDetailDialog,
    closeConfirmDialog,
    handleStartOnboarding,
    closeOnboardingDialog
  }
}
