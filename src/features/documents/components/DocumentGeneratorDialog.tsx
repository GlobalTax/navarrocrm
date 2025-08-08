import { DocumentGeneratorDialog as BaseDocumentGeneratorDialog } from '../../../components/documents/DocumentGeneratorDialog'

interface DocumentGeneratorDialogProps {
  open: boolean
  onClose: () => void
}

export const DocumentGeneratorDialog = ({ open, onClose }: DocumentGeneratorDialogProps) => {
  return (
    <BaseDocumentGeneratorDialog
      open={open}
      onOpenChange={onClose}
      templateId=""
    />
  )
}