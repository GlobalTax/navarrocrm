
import { Loader2 } from 'lucide-react'

export const ProposalsLoadingState = () => {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="flex items-center gap-2">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span>Cargando propuestas...</span>
      </div>
    </div>
  )
}
