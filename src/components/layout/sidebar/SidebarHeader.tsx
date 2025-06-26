
import { Building2 } from 'lucide-react'

interface SidebarHeaderProps {
  collapsed?: boolean
}

export const SidebarHeader: React.FC<SidebarHeaderProps> = ({ collapsed = false }) => {
  return (
    <div className="flex items-center px-4 mb-6">
      <div className="flex items-center">
        <div className="flex-shrink-0 capittal-border-light rounded-capittal p-2 bg-white">
          <Building2 className="h-6 w-6 text-black" />
        </div>
        {!collapsed && (
          <div className="ml-3">
            <h1 className="text-xl font-bold text-gray-900">
              LegalFlow
            </h1>
            <p className="text-sm text-gray-500">
              CRM Asesoría Legal
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
