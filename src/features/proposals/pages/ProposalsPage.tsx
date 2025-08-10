import { useState } from 'react'
import { ProposalsList } from '../components/ProposalsList'
import { ProposalsBuilderManager } from '../components/ProposalsBuilderManager'
import { ProposalConfirmationDialog } from '../components/ProposalConfirmationDialog'
import { useProposalsQueries, useProposalsActions } from '@/features/proposals'

export default function ProposalsPage() {
  const [isRecurrentBuilderOpen, setIsRecurrentBuilderOpen] = useState(false)
  const [isSpecificBuilderOpen, setIsSpecificBuilderOpen] = useState(false)
  const [selectedProposal, setSelectedProposal] = useState<any>(null)
  const [isEditMode, setIsEditMode] = useState(false)

  const { proposals } = useProposalsQueries()
  const { updateProposalStatus } = useProposalsActions()

  const handleCreateRecurrentProposal = () => {
    setIsEditMode(false)
    setSelectedProposal(null)
    setIsRecurrentBuilderOpen(true)
  }

  const handleCreateSpecificProposal = () => {
    setIsEditMode(false)
    setSelectedProposal(null)
    setIsSpecificBuilderOpen(true)
  }

  const handleEditProposal = (proposal: any) => {
    setIsEditMode(true)
    setSelectedProposal(proposal)
    if (proposal.is_recurring) {
      setIsRecurrentBuilderOpen(true)
    } else {
      setIsSpecificBuilderOpen(true)
    }
  }

  const handleViewProposal = (proposal: any) => {
    console.log('View proposal:', proposal)
    // Navigate to proposal detail view
  }

  const handleStatusChange = (id: string, status: any) => {
    updateProposalStatus.mutateAsync({ id, status })
  }

  const handleSaveRecurrentProposal = (data: any) => {
    console.log('Save recurrent proposal:', data)
    setIsRecurrentBuilderOpen(false)
    setIsSpecificBuilderOpen(false)
  }

  const handleUpdateProposal = (proposalId: string, data: any) => {
    console.log('Update proposal:', proposalId, data)
    setIsRecurrentBuilderOpen(false)
    setIsSpecificBuilderOpen(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Propuestas</h1>
        <div className="flex gap-2">
          <button
            onClick={handleCreateRecurrentProposal}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Propuesta Recurrente
          </button>
          <button
            onClick={handleCreateSpecificProposal}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Propuesta Específica
          </button>
        </div>
      </div>

      <ProposalsList
        onCreateProposal={handleCreateRecurrentProposal}
        onEditProposal={handleEditProposal}
        onViewProposal={handleViewProposal}
        onStatusChange={handleStatusChange}
      />

      <ProposalsBuilderManager
        isRecurrentBuilderOpen={isRecurrentBuilderOpen}
        isSpecificBuilderOpen={isSpecificBuilderOpen}
        onCloseRecurrentBuilder={() => setIsRecurrentBuilderOpen(false)}
        onCloseSpecificBuilder={() => setIsSpecificBuilderOpen(false)}
        onSaveRecurrentProposal={handleSaveRecurrentProposal}
        isSavingRecurrent={false}
        isEditMode={isEditMode}
        editingProposal={selectedProposal}
        onUpdateProposal={handleUpdateProposal}
      />
    </div>
  )
}