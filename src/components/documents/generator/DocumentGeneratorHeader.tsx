import { FileText, Bot } from 'lucide-react'
import { DialogHeader, DialogTitle } from '@/components/ui/dialog'

interface DocumentGeneratorHeaderProps {
  templateName: string
  isAiEnhanced: boolean
}

export const DocumentGeneratorHeader = ({ 
  templateName, 
  isAiEnhanced 
}: DocumentGeneratorHeaderProps) => {
  return (
    <DialogHeader>
      <DialogTitle className="flex items-center gap-2">
        <FileText className="h-5 w-5" />
        Generar: {templateName}
        {isAiEnhanced && <Bot className="h-4 w-4 text-primary" />}
      </DialogTitle>
    </DialogHeader>
  )
}