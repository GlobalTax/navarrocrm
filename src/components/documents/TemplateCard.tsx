import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  FileText, 
  Bot, 
  Settings, 
  Star, 
  Copy, 
  Eye, 
  MoreHorizontal,
  MessageCircle,
  Gavel
} from 'lucide-react'
import { DocumentTemplate } from '@/hooks/useDocumentTemplates'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

interface TemplateCardProps {
  template: DocumentTemplate
  isFavorite: boolean
  onGenerate: (templateId: string) => void
  onEdit: (templateId: string) => void
  onDuplicate: (templateId: string) => void
  onToggleFavorite: (templateId: string) => void
  onPreview: (templateId: string) => void
  viewMode: 'grid' | 'list'
}

export const TemplateCard = ({
  template,
  isFavorite,
  onGenerate,
  onEdit,
  onDuplicate,
  onToggleFavorite,
  onPreview,
  viewMode
}: TemplateCardProps) => {
  const [isHovered, setIsHovered] = useState(false)

  const getDocumentTypeIcon = (type: string) => {
    switch (type) {
      case 'contract':
        return <FileText className="h-4 w-4" />
      case 'communication':
        return <MessageCircle className="h-4 w-4" />
      case 'procedural':
        return <Gavel className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  const getDocumentTypeLabel = (type: string) => {
    switch (type) {
      case 'contract':
        return 'Contrato'
      case 'communication':
        return 'Comunicación'
      case 'procedural':
        return 'Procesal'
      default:
        return type
    }
  }

  const getDocumentTypeColor = (type: string) => {
    switch (type) {
      case 'contract':
        return 'bg-primary/10 text-primary border-primary/20'
      case 'communication':
        return 'bg-blue-50 text-blue-700 border-blue-200'
      case 'procedural':
        return 'bg-purple-50 text-purple-700 border-purple-200'
      default:
        return 'bg-muted text-muted-foreground border-muted'
    }
  }

  // Calcular preview del contenido
  const contentPreview = template.template_content
    .replace(/{{.*?}}/g, '[Variable]') // Reemplazar variables para el preview
    .substring(0, 150) + '...'

  if (viewMode === 'list') {
    return (
      <Card 
        className="hover:shadow-md transition-all duration-200 card-hover cursor-pointer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            {/* Icono y tipo */}
            <div className="flex-shrink-0">
              <div className="p-3 bg-muted rounded-lg">
                {getDocumentTypeIcon(template.document_type)}
              </div>
            </div>

            {/* Información principal */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium text-foreground truncate">
                    {template.name}
                  </h3>
                  {template.is_ai_enhanced && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Bot className="h-4 w-4 text-primary" />
                        </TooltipTrigger>
                        <TooltipContent>Mejorado con IA</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onToggleFavorite(template.id)}
                    className="p-1"
                  >
                    <Star 
                      className={`h-4 w-4 ${isFavorite ? 'fill-primary text-primary' : 'text-muted-foreground'}`} 
                    />
                  </Button>
                </div>
              </div>

              {template.description && (
                <p className="text-sm text-muted-foreground line-clamp-1 mb-2">
                  {template.description}
                </p>
              )}

              <div className="flex items-center gap-2 mb-2">
                <Badge className={`${getDocumentTypeColor(template.document_type)} text-xs`}>
                  {getDocumentTypeLabel(template.document_type)}
                </Badge>
                {template.category && (
                  <Badge variant="outline" className="text-xs">
                    {template.category}
                  </Badge>
                )}
                {template.practice_area && (
                  <Badge variant="secondary" className="text-xs">
                    {template.practice_area}
                  </Badge>
                )}
              </div>

              <p className="text-xs text-muted-foreground line-clamp-2">
                {contentPreview}
              </p>
            </div>

            {/* Acciones */}
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                onClick={() => onGenerate(template.id)}
                className="gap-2"
              >
                <FileText className="h-4 w-4" />
                Generar
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onPreview(template.id)}>
                    <Eye className="h-4 w-4 mr-2" />
                    Vista Previa
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onEdit(template.id)}>
                    <Settings className="h-4 w-4 mr-2" />
                    Editar
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onDuplicate(template.id)}>
                    <Copy className="h-4 w-4 mr-2" />
                    Duplicar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Vista de grid (tarjetas)
  return (
    <Card 
      className="hover:shadow-md transition-all duration-200 card-hover cursor-pointer relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Header con título y favorito */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <h3 className="font-medium text-foreground line-clamp-2 text-sm">
                {template.name}
              </h3>
              {template.is_ai_enhanced && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Bot className="h-4 w-4 text-primary flex-shrink-0" />
                    </TooltipTrigger>
                    <TooltipContent>Mejorado con IA</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onToggleFavorite(template.id)}
              className="p-1 flex-shrink-0"
            >
              <Star 
                className={`h-4 w-4 ${isFavorite ? 'fill-primary text-primary' : 'text-muted-foreground'}`} 
              />
            </Button>
          </div>

          {/* Descripción */}
          {template.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {template.description}
            </p>
          )}

          {/* Preview del contenido */}
          <div className="bg-muted/50 rounded-md p-2">
            <p className="text-xs text-muted-foreground line-clamp-3 font-mono">
              {contentPreview}
            </p>
          </div>

          {/* Badges */}
          <div className="flex flex-wrap items-center gap-1">
            <Badge className={`${getDocumentTypeColor(template.document_type)} text-xs`}>
              {getDocumentTypeLabel(template.document_type)}
            </Badge>
            {template.category && (
              <Badge variant="outline" className="text-xs">
                {template.category}
              </Badge>
            )}
          </div>

          {template.practice_area && (
            <p className="text-xs text-muted-foreground">
              Área: {template.practice_area}
            </p>
          )}

          {/* Variables count */}
          <p className="text-xs text-muted-foreground">
            {template.variables.length} variable{template.variables.length !== 1 ? 's' : ''}
          </p>

          {/* Acciones */}
          <div className="flex gap-2 pt-2">
            <Button
              size="sm"
              onClick={() => onGenerate(template.id)}
              className="flex-1"
            >
              Generar
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onPreview(template.id)}>
                  <Eye className="h-4 w-4 mr-2" />
                  Vista Previa
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onEdit(template.id)}>
                  <Settings className="h-4 w-4 mr-2" />
                  Editar
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onDuplicate(template.id)}>
                  <Copy className="h-4 w-4 mr-2" />
                  Duplicar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}