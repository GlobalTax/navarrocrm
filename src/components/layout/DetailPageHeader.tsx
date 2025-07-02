import { ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Breadcrumbs } from './Breadcrumbs'

interface DetailPageHeaderProps {
  title: string
  subtitle?: string
  breadcrumbItems: Array<{ label: string; href?: string }>
  backUrl: string
  children?: ReactNode
}

export const DetailPageHeader = ({ 
  title, 
  subtitle, 
  breadcrumbItems, 
  backUrl, 
  children 
}: DetailPageHeaderProps) => {
  const navigate = useNavigate()

  return (
    <div className="bg-white border-b">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="space-y-3">
          <Breadcrumbs items={breadcrumbItems} />
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(backUrl)}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Volver
              </Button>
              <div className="h-6 w-px bg-gray-300" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
                {subtitle && (
                  <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
                )}
              </div>
            </div>

            {children && (
              <div className="flex items-center gap-2">
                {children}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}