
interface SidebarHeaderProps {
  title?: string
}

export const SidebarHeader = ({ title = "LegalCRM" }: SidebarHeaderProps) => {
  return (
    <div className="flex items-center flex-shrink-0 px-4 mb-6">
      <h1 className="text-xl font-bold text-gray-900">{title}</h1>
    </div>
  )
}
