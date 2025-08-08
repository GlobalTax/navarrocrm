// Placeholder component for documents list
interface DocumentsListProps {
  documents: any[]
  isLoading: boolean
}

export const DocumentsList = ({ documents, isLoading }: DocumentsListProps) => {
  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="border-0.5 border-black rounded-[10px] p-6">
      <p className="text-muted-foreground text-center">
        Lista de documentos - Componente en desarrollo
      </p>
    </div>
  )
}