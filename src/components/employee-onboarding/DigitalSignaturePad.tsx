import React, { useRef, useEffect, useState } from 'react'
import { Canvas as FabricCanvas, PencilBrush, Color } from 'fabric'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  PenTool, 
  RotateCcw, 
  Check, 
  Download,
  Palette,
  Square
} from 'lucide-react'
import { toast } from 'sonner'

interface DigitalSignaturePadProps {
  onSignatureChange: (signatureData: string) => void
  width?: number
  height?: number
  backgroundColor?: string
  penColor?: string
  penWidth?: number
  className?: string
}

export function DigitalSignaturePad({
  onSignatureChange,
  width = 600,
  height = 200,
  backgroundColor = '#ffffff',
  penColor = '#000000',
  penWidth = 2,
  className = ''
}: DigitalSignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [fabricCanvas, setFabricCanvas] = useState<FabricCanvas | null>(null)
  const [currentPenColor, setCurrentPenColor] = useState(penColor)
  const [currentPenWidth, setPenWidth] = useState(penWidth)
  const [hasSignature, setHasSignature] = useState(false)
  const [isDrawing, setIsDrawing] = useState(false)

  useEffect(() => {
    if (!canvasRef.current) return

    const canvas = new FabricCanvas(canvasRef.current, {
      width: width,
      height: height,
      backgroundColor: backgroundColor,
      isDrawingMode: true,
      preserveObjectStacking: true
    })

    // Configure drawing brush
    const brush = new PencilBrush(canvas)
    brush.color = currentPenColor
    brush.width = currentPenWidth
    canvas.freeDrawingBrush = brush

    setFabricCanvas(canvas)

    // Handle drawing events
    canvas.on('path:created', () => {
      setHasSignature(true)
      const dataURL = canvas.toDataURL({
        format: 'png',
        quality: 1,
        multiplier: 2
      })
      onSignatureChange(dataURL)
    })

    canvas.on('mouse:down', () => setIsDrawing(true))
    canvas.on('mouse:up', () => setIsDrawing(false))

    return () => {
      canvas.dispose()
    }
  }, [width, height, backgroundColor])

  // Update brush properties when they change
  useEffect(() => {
    if (fabricCanvas && fabricCanvas.freeDrawingBrush) {
      fabricCanvas.freeDrawingBrush.color = currentPenColor
      fabricCanvas.freeDrawingBrush.width = currentPenWidth
    }
  }, [currentPenColor, currentPenWidth, fabricCanvas])

  const clearSignature = () => {
    if (fabricCanvas) {
      fabricCanvas.clear()
      fabricCanvas.backgroundColor = backgroundColor
      fabricCanvas.renderAll()
      setHasSignature(false)
      onSignatureChange('')
      toast.success('Firma borrada')
    }
  }

  const downloadSignature = () => {
    if (fabricCanvas && hasSignature) {
      const dataURL = fabricCanvas.toDataURL({
        format: 'png',
        quality: 1,
        multiplier: 2
      })
      
      const link = document.createElement('a')
      link.download = `firma-digital-${Date.now()}.png`
      link.href = dataURL
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      toast.success('Firma descargada')
    }
  }

  const penColors = [
    { color: '#000000', name: 'Negro' },
    { color: '#0066cc', name: 'Azul' },
    { color: '#006600', name: 'Verde' },
    { color: '#cc0000', name: 'Rojo' }
  ]

  const penWidths = [
    { width: 1, name: 'Fino' },
    { width: 2, name: 'Normal' },
    { width: 3, name: 'Grueso' },
    { width: 4, name: 'Muy grueso' }
  ]

  return (
    <div className={`space-y-4 ${className}`}>
      <Card className="border-0.5 border-gray-200 rounded-[10px]">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <PenTool className="h-5 w-5 text-purple-600" />
              <div>
                <CardTitle className="text-lg">Firma Digital</CardTitle>
                <p className="text-sm text-gray-600">
                  Dibuja tu firma usando el ratón o pantalla táctil
                </p>
              </div>
            </div>
            {hasSignature && (
              <Badge variant="outline" className="text-green-600 border-green-600">
                <Check className="h-3 w-3 mr-1" />
                Firmado
              </Badge>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Signature Controls */}
          <div className="flex flex-wrap items-center gap-4">
            {/* Pen Color */}
            <div className="flex items-center gap-2">
              <Palette className="h-4 w-4 text-gray-600" />
              <span className="text-sm text-gray-600">Color:</span>
              <div className="flex gap-1">
                {penColors.map((colorOption) => (
                  <button
                    key={colorOption.color}
                    onClick={() => setCurrentPenColor(colorOption.color)}
                    className={`
                      w-6 h-6 rounded-full border-2 transition-all duration-200
                      ${currentPenColor === colorOption.color 
                        ? 'border-gray-800 scale-110' 
                        : 'border-gray-300 hover:border-gray-500'
                      }
                    `}
                    style={{ backgroundColor: colorOption.color }}
                    title={colorOption.name}
                  />
                ))}
              </div>
            </div>

            {/* Pen Width */}
            <div className="flex items-center gap-2">
              <Square className="h-4 w-4 text-gray-600" />
              <span className="text-sm text-gray-600">Grosor:</span>
              <div className="flex gap-1">
                {penWidths.map((widthOption) => (
                  <button
                    key={widthOption.width}
                    onClick={() => setPenWidth(widthOption.width)}
                    className={`
                      px-2 py-1 text-xs rounded-md border transition-all duration-200
                      ${currentPenWidth === widthOption.width
                        ? 'bg-blue-100 border-blue-500 text-blue-700'
                        : 'bg-white border-gray-300 text-gray-600 hover:border-gray-400'
                      }
                    `}
                    title={widthOption.name}
                  >
                    {widthOption.width}px
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Signature Canvas */}
          <div className="relative">
            <div className="border-2 border-dashed border-gray-300 rounded-[10px] p-4 bg-white">
              <canvas
                ref={canvasRef}
                className="border border-gray-200 rounded-md cursor-crosshair"
                style={{ 
                  display: 'block',
                  maxWidth: '100%',
                  height: 'auto'
                }}
              />
              
              {!hasSignature && !isDrawing && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <p className="text-gray-400 text-sm">
                    Haz clic y dibuja tu firma aquí
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between items-center">
            <Button
              variant="outline"
              onClick={clearSignature}
              disabled={!hasSignature}
              className="gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Borrar Firma
            </Button>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={downloadSignature}
                disabled={!hasSignature}
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                Descargar
              </Button>
            </div>
          </div>

          {/* Legal Notice */}
          <div className="bg-amber-50 border border-amber-200 rounded-[10px] p-3">
            <p className="text-xs text-amber-800">
              <strong>Aviso Legal:</strong> Esta firma digital tiene validez legal equivalente 
              a una firma manuscrita. Al firmar, aceptas los términos y condiciones del proceso 
              de incorporación y confirmas la veracidad de la información proporcionada.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}