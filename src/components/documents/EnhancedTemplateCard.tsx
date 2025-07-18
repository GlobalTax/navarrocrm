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
  Gavel,
  Zap,
  Clock,
  Users,
  Sparkles
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

interface EnhancedTemplateCardProps {
  template: DocumentTemplate
  isFavorite: boolean
  onGenerate: (templateId: string) => void
  onEdit: (templateId: string) => void
  onDuplicate: (templateId: string) => void
  onToggleFavorite: (templateId: string) => void
  onPreview: (templateId: string) => void
  viewMode: 'grid' | 'list'
}

export const EnhancedTemplateCard = ({
  template,
  isFavorite,
  onGenerate,
  onEdit,
  onDuplicate,
  onToggleFavorite,
  onPreview,
  viewMode
}: EnhancedTemplateCardProps) => {
  const [isHovered, setIsHovered] = useState(false)

  const getDocumentTypeIcon = (type: string) => {
    switch (type) {
      case 'contract':
        return <FileText className="h-5 w-5" />
      case 'communication':
        return <MessageCircle className="h-5 w-5" />
      case 'procedural':
        return <Gavel className="h-5 w-5" />
      default:
        return <FileText className="h-5 w-5" />
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

  const contentPreview = template.template_content
    .replace(/{{.*?}}/g, '[Variable]')
    .substring(0, 100) + '...'

  if (viewMode === 'list') {
    return (
      <Card 
        className="group hover:shadow-lg transition-all duration-300 border-l-4 border-l-primary/20 hover:border-l-primary cursor-pointer bg-gradient-to-r from-background to-muted/20"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <CardContent className="p-6">
          <div className="flex items-center gap-6">
            {/* Icono del tipo */}
            <div className={`p-4 rounded-xl ${getDocumentTypeColor(template.document_type).replace('text-', 'bg-').replace('border-', '').split(' ')[0]}/10`}>
              {getDocumentTypeIcon(template.document_type)}
            </div>

            {/* Información principal */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <h3 className="font-semibold text-lg text-foreground truncate">
                    {template.name}
                  </h3>
                  {template.is_ai_enhanced && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <div className="flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full">
                            <Sparkles className="h-3 w-3 text-purple-600" />
                            <span className="text-xs font-medium text-purple-700">IA</span>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>Mejorado con IA</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onToggleFavorite(template.id)}
                    className="p-1 hover:bg-amber-100"
                  >
                    <Star 
                      className={`h-4 w-4 transition-colors ${
                        isFavorite 
                          ? 'fill-amber-500 text-amber-500' 
                          : 'text-muted-foreground hover:text-amber-500'
                      }`} 
                    />
                  </Button>
                </div>
              </div>

              {template.description && (
                <p className="text-muted-foreground line-clamp-2 mb-3">
                  {template.description}
                </p>
              )}

              <div className="flex items-center gap-2 mb-3">
                <Badge className={`${getDocumentTypeColor(template.document_type)} font-medium`}>
                  {getDocumentTypeLabel(template.document_type)}
                </Badge>
                {template.category && (
                  <Badge variant="outline">
                    {template.category}
                  </Badge>
                )}
                {template.practice_area && (
                  <Badge variant="secondary">
                    {template.practice_area}
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {template.variables.length} variables
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  Creado {new Date(template.created_at).toLocaleDateString('es-ES')}
                </div>
              </div>
            </div>

            {/* Acciones */}
            <div className="flex items-center gap-2">
              <Button
                onClick={() => onGenerate(template.id)}
                className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-md"
              >
                <Zap className="h-4 w-4" />
                Generar
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="shadow-sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
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

  // Vista de grid mejorada
  return (
    <Card 
      className="group hover:shadow-xl transition-all duration-300 cursor-pointer border border-muted hover:border-primary/50 bg-gradient-to-br from-background to-muted/30 overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Header con icono y favorito */}
          <div className="flex items-start justify-between">
            <div className={`p-3 rounded-xl ${getDocumentTypeColor(template.document_type).replace('text-', 'bg-').replace('border-', '').split(' ')[0]}/10 group-hover:scale-110 transition-transform duration-200`}>
              {getDocumentTypeIcon(template.document_type)}
            </div>
            <div className="flex items-center gap-2">
              {template.is_ai_enhanced && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <div className="flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full">
                        <Sparkles className="h-3 w-3 text-purple-600" />
                        <span className="text-xs font-medium text-purple-700">IA</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>Mejorado con IA</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onToggleFavorite(template.id)}
                className="p-1 hover:bg-amber-100"
              >
                <Star 
                  className={`h-4 w-4 transition-colors ${
                    isFavorite 
                      ? 'fill-amber-500 text-amber-500' 
                      : 'text-muted-foreground hover:text-amber-500'
                  }`} 
                />
              </Button>
            </div>
          </div>

          {/* Título */}
          <div>
            <h3 className="font-semibold text-foreground line-clamp-2 text-base group-hover:text-primary transition-colors">
              {template.name}
            </h3>
            {template.description && (
              <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                {template.description}
              </p>
            )}
          </div>

          {/* Preview del contenido */}
          <div className="bg-muted/50 rounded-lg p-3 border border-dashed border-muted">
            <p className="text-xs text-muted-foreground line-clamp-3 font-mono">
              {contentPreview}
            </p>
          </div>

          {/* Badges */}
          <div className="flex flex-wrap items-center gap-2">
            <Badge className={`${getDocumentTypeColor(template.document_type)} font-medium`}>
              {getDocumentTypeLabel(template.document_type)}
            </Badge>
            {template.category && (
              <Badge variant="outline" className="text-xs">
                {template.category}
              </Badge>
            )}
          </div>

          {/* Metadatos */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {template.variables.length} vars
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {new Date(template.created_at).toLocaleDateString('es-ES')}
            </div>
          </div>

          {/* Acciones */}
          <div className="flex gap-2 pt-2">
            <Button
              onClick={() => onGenerate(template.id)}
              className="flex-1 gap-2 bg-primary hover:bg-primary/90 shadow-md"
            >
              <Zap className="h-4 w-4" />
              Generar
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="shadow-sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
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