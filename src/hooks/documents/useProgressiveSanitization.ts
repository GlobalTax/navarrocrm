
import { useState, useCallback, useRef } from 'react'
import { useLogger } from '@/hooks/useLogger'

interface SanitizationOptions {
  chunkSize?: number
  maxProcessingTime?: number
  preserveFormatting?: boolean
  strictMode?: boolean
}

interface SanitizationProgress {
  processed: number
  total: number
  percentage: number
  currentChunk: number
  estimatedTime: number
}

interface SanitizationResult {
  sanitizedContent: string
  removedElements: string[]
  processedChunks: number
  totalTime: number
  warnings: string[]
}

export const useProgressiveSanitization = (options: SanitizationOptions = {}) => {
  const {
    chunkSize = 50000,
    maxProcessingTime = 5000,
    preserveFormatting = true,
    strictMode = false
  } = options

  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState<SanitizationProgress | null>(null)
  const abortController = useRef<AbortController | null>(null)
  const logger = useLogger('ProgressiveSanitization')

  // Reglas de sanitización avanzadas
  const getSanitizationRules = useCallback(() => {
    const baseRules = {
      allowedTags: ['p', 'br', 'strong', 'em', 'u', 'ol', 'ul', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
      allowedAttributes: {
        '*': ['class', 'style'],
        'a': ['href', 'title'],
        'img': ['src', 'alt', 'width', 'height']
      },
      forbiddenTags: ['script', 'object', 'embed', 'iframe', 'form', 'input']
    }

    if (strictMode) {
      baseRules.allowedTags = ['p', 'br', 'strong', 'em']
      baseRules.allowedAttributes = {}
    }

    if (preserveFormatting) {
      baseRules.allowedTags.push('div', 'span', 'table', 'tr', 'td', 'th')
      baseRules.allowedAttributes['*'].push('data-*')
    }

    return baseRules
  }, [strictMode, preserveFormatting])

  // Sanitización en chunks con Worker (simulado)
  const sanitizeChunk = useCallback(async (
    chunk: string,
    chunkIndex: number,
    rules: any
  ): Promise<{ sanitized: string; removed: string[]; warnings: string[] }> => {
    return new Promise((resolve) => {
      // Simular processing en worker
      setTimeout(() => {
        const removed: string[] = []
        const warnings: string[] = []
        
        // Remover scripts y elementos peligrosos
        let sanitized = chunk.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, (match) => {
          removed.push('script')
          return ''
        })

        // Remover atributos peligrosos
        sanitized = sanitized.replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, (match) => {
          warnings.push(`Removed event handler: ${match.trim()}`)
          return ''
        })

        // Validar URLs en href y src
        sanitized = sanitized.replace(/(href|src)\s*=\s*["']([^"']*)["']/gi, (match, attr, url) => {
          if (url.toLowerCase().startsWith('javascript:') || url.toLowerCase().startsWith('data:')) {
            warnings.push(`Blocked potentially dangerous URL: ${url}`)
            return ''
          }
          return match
        })

        // Limitar nesting excesivo (prevenir DoS)
        const maxNesting = 10
        let nestingLevel = 0
        sanitized = sanitized.replace(/<[^>]+>/g, (tag) => {
          if (tag.startsWith('</')) {
            nestingLevel--
          } else if (!tag.endsWith('/>')) {
            nestingLevel++
            if (nestingLevel > maxNesting) {
              warnings.push(`Excessive nesting detected, tag removed: ${tag}`)
              return ''
            }
          }
          return tag
        })

        resolve({ sanitized, removed, warnings })
      }, Math.random() * 50 + 10) // Simular tiempo de procesamiento
    })
  }, [])

  // Función principal de sanitización progresiva
  const sanitizeProgressively = useCallback(async (
    content: string
  ): Promise<SanitizationResult> => {
    if (isProcessing) {
      throw new Error('Sanitization already in progress')
    }

    setIsProcessing(true)
    abortController.current = new AbortController()
    
    const startTime = Date.now()
    const rules = getSanitizationRules()
    const totalLength = content.length
    const chunks = Math.ceil(totalLength / chunkSize)
    
    logger.info('🧼 Iniciando sanitización progresiva', {
      contentLength: totalLength,
      chunks,
      chunkSize,
      strictMode,
      preserveFormatting
    })

    try {
      let sanitizedContent = ''
      const allRemoved: string[] = []
      const allWarnings: string[] = []
      let processedBytes = 0

      for (let i = 0; i < chunks; i++) {
        if (abortController.current?.signal.aborted) {
          throw new Error('Sanitization aborted')
        }

        const start = i * chunkSize
        const end = Math.min(start + chunkSize, totalLength)
        const chunk = content.slice(start, end)
        
        // Actualizar progreso
        const currentProgress: SanitizationProgress = {
          processed: processedBytes,
          total: totalLength,
          percentage: Math.round((processedBytes / totalLength) * 100),
          currentChunk: i + 1,
          estimatedTime: ((Date.now() - startTime) / (i || 1)) * (chunks - i)
        }
        setProgress(currentProgress)

        // Procesar chunk
        const result = await sanitizeChunk(chunk, i, rules)
        sanitizedContent += result.sanitized
        allRemoved.push(...result.removed)
        allWarnings.push(...result.warnings)
        
        processedBytes += chunk.length

        // Verificar tiempo límite
        if (Date.now() - startTime > maxProcessingTime) {
          allWarnings.push(`Processing time limit reached, remaining content processed with basic sanitization`)
          sanitizedContent += content.slice(end).replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
          break
        }
      }

      const totalTime = Date.now() - startTime
      const result: SanitizationResult = {
        sanitizedContent,
        removedElements: [...new Set(allRemoved)],
        processedChunks: Math.min(chunks, Math.ceil(processedBytes / chunkSize)),
        totalTime,
        warnings: allWarnings
      }

      logger.info('✅ Sanitización completada', {
        totalTime,
        processedChunks: result.processedChunks,
        removedElements: result.removedElements.length,
        warnings: result.warnings.length
      })

      return result

    } catch (error) {
      logger.error('❌ Error en sanitización:', error)
      throw error
    } finally {
      setIsProcessing(false)
      setProgress(null)
      abortController.current = null
    }
  }, [isProcessing, chunkSize, maxProcessingTime, getSanitizationRules, sanitizeChunk, logger])

  const abort = useCallback(() => {
    if (abortController.current) {
      abortController.current.abort()
      logger.info('🛑 Sanitización abortada por usuario')
    }
  }, [logger])

  // Cache de resultados para evitar re-procesamiento
  const cache = useRef(new Map<string, SanitizationResult>())
  
  const getCacheKey = useCallback((content: string) => {
    // Hash simple para cache key
    let hash = 0
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32bit integer
    }
    return `${hash}_${strictMode}_${preserveFormatting}`
  }, [strictMode, preserveFormatting])

  const sanitizeWithCache = useCallback(async (content: string): Promise<SanitizationResult> => {
    const cacheKey = getCacheKey(content)
    
    if (cache.current.has(cacheKey)) {
      logger.info('📋 Usando resultado cacheado')
      return cache.current.get(cacheKey)!
    }

    const result = await sanitizeProgressively(content)
    
    // Mantener cache limitado
    if (cache.current.size > 50) {
      const firstKey = cache.current.keys().next().value
      cache.current.delete(firstKey)
    }
    
    cache.current.set(cacheKey, result)
    return result
  }, [getCacheKey, sanitizeProgressively, logger])

  return {
    sanitizeProgressively: sanitizeWithCache,
    isProcessing,
    progress,
    abort,
    clearCache: () => cache.current.clear()
  }
}
