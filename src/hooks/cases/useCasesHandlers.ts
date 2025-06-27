
import { useState } from 'react'
import { Case, CreateCaseData } from './types'
import { exportCasesToCSV } from '@/utils/exportUtils'
import { toast } from 'sonner'

export const useCasesHandlers = (
  createCase: (data: CreateCaseData) => void,
  deleteCase: (caseId: string) => void,
  archiveCase: (caseId: string) => void
) => {
  const [selectedCase, setSelectedCase] = useState<Case | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [isWizardOpen, setIsWizardOpen] = useState(false)
  const [isWorkspaceOpen, setIsWorkspaceOpen] = useState(false) // Nuevo estado
  const [selectedCases, setSelectedCases] = useState<string[]>([])
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isArchiveDialogOpen, setIsArchiveDialogOpen] = useState(false)
  const [caseToDelete, setCaseToDelete] = useState<Case | null>(null)
  const [caseToArchive, setCaseToArchive] = useState<Case | null>(null)

  const handleViewCase = (case_: Case) => {
    setSelectedCase(case_)
    setIsDetailOpen(true)
  }

  // Nueva función para abrir el workspace
  const handleOpenWorkspace = (case_: Case) => {
    setSelectedCase(case_)
    setIsWorkspaceOpen(true)
  }

  // Nueva función para cerrar el workspace
  const handleCloseWorkspace = () => {
    setIsWorkspaceOpen(false)
    setSelectedCase(null)
  }

  const handleEditCase = (case_: Case) => {
    setSelectedCase(case_)
    setIsWizardOpen(true)
  }

  const handleDeleteCase = (case_: Case) => {
    setCaseToDelete(case_)
    setIsDeleteDialogOpen(true)
  }

  const handleArchiveCase = (case_: Case) => {
    setCaseToArchive(case_)
    setIsArchiveDialogOpen(true)
  }

  const handleConfirmDelete = (caseId: string) => {
    deleteCase(caseId)
    setIsDeleteDialogOpen(false)
    setCaseToDelete(null)
  }

  const handleConfirmArchive = (caseId: string) => {
    archiveCase(caseId)
    setIsArchiveDialogOpen(false)
    setCaseToArchive(null)
  }

  const handleSelectCase = (caseId: string, selected: boolean) => {
    if (selected) {
      setSelectedCases([...selectedCases, caseId])
    } else {
      setSelectedCases(selectedCases.filter(id => id !== caseId))
    }
  }

  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      // This will be passed from the parent component
    } else {
      setSelectedCases([])
    }
  }

  const handleExportCases = (cases: Case[]) => {
    const success = exportCasesToCSV(cases)
    if (success) {
      toast.success('Expedientes exportados exitosamente')
    } else {
      toast.error('Error al exportar expedientes')
    }
  }

  const handleUseTemplate = (templateId: string) => {
    toast.info(`Funcionalidad de plantilla ${templateId} en desarrollo`)
  }

  return {
    selectedCase,
    setSelectedCase,
    isDetailOpen,
    setIsDetailOpen,
    isWizardOpen,
    setIsWizardOpen,
    isWorkspaceOpen, // Nuevo estado exportado
    setIsWorkspaceOpen,
    selectedCases,
    setSelectedCases,
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    isArchiveDialogOpen,
    setIsArchiveDialogOpen,
    caseToDelete,
    setCaseToDelete,
    caseToArchive,
    setCaseToArchive,
    handleViewCase,
    handleOpenWorkspace, // Nueva función exportada
    handleCloseWorkspace, // Nueva función exportada
    handleEditCase,
    handleDeleteCase,
    handleArchiveCase,
    handleConfirmDelete,
    handleConfirmArchive,
    handleSelectCase,
    handleSelectAll,
    handleExportCases,
    handleUseTemplate
  }
}
