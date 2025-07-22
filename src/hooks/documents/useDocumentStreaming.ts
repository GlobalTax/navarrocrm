
import { useState, useCallback, useRef } from 'react'
import { useLogger } from '@/hooks/useLogger'

interface StreamingOptions {
  chunkSize?: number
  maxFileSize?: number
  allowedTypes?: string[]
  progressInterval?: number
}

interface UploadProgress {
  loaded: number
  total: number
  percentage: number
  speed: number
  estimatedTime: number
  currentChunk: number
  totalChunks: number
}

interface StreamingResult {
  fileId: string
  url: string
  metadata: {
    size: number
    type: string
    name: string
    chunks: number
    uploadTime: number
  }
}

export const useDocumentStreaming = (options: StreamingOptions = {}) => {
  const {
    chunkSize = 1024 * 1024, // 1MB chunks
    maxFileSize = 100 * 1024 * 1024, // 100MB max
    allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'],
    progressInterval = 100
  } = options

  const [isUploading, setIsUploading] = useState(false)
  const [progress, setProgress] = useState<UploadProgress | null>(null)
  const [isPaused, setIsPaused] = useState(false)
  const abortController = useRef<AbortController | null>(null)
  const pausedChunkIndex = useRef<number>(0)
  const uploadedChunks = useRef<Set<number>>(new Set())
  const logger = useLogger('DocumentStreaming')

  // Validación de archivo
  const validateFile = useCallback((file: File): { valid: boolean; error?: string } => {
    if (!allowedTypes.includes(file.type)) {
      return { valid: false, error: `Tipo de archivo no permitido: ${file.type}` }
    }

    if (file.size > maxFileSize) {
      return { valid: false, error: `Archivo demasiado grande: ${(file.size / 1024 / 1024).toFixed(1)}MB > ${(maxFileSize / 1024 / 1024).toFixed(1)}MB` }
    }

    return { valid: true }
  }, [allowedTypes, maxFileSize])

  // Dividir archivo en chunks
  const createChunks = useCallback((file: File): Blob[] => {
    const chunks: Blob[] = []
    const totalChunks = Math.ceil(file.size / chunkSize)

    for (let i = 0; i < totalChunks; i++) {
      const start = i * chunkSize
      const end = Math.min(start + chunkSize, file.size)
      chunks.push(file.slice(start, end))
    }

    return chunks
  }, [chunkSize])

  // Upload de un chunk individual con retry
  const uploadChunk = useCallback(async (
    chunk: Blob,
    chunkIndex: number,
    totalChunks: number,
    fileId: string,
    retryCount = 0
  ): Promise<void> => {
    const maxRetries = 3
    
    try {
      const formData = new FormData()
      formData.append('chunk', chunk)
      formData.append('chunkIndex', chunkIndex.toString())
      formData.append('totalChunks', totalChunks.toString())
      formData.append('fileId', fileId)

      const response = await fetch('/api/upload-chunk', {
        method: 'POST',
        body: formData,
        signal: abortController.current?.signal
      })

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`)
      }

      uploadedChunks.current.add(chunkIndex)
      
    } catch (error) {
      if (retryCount < maxRetries && !abortController.current?.signal.aborted) {
        logger.warn(`🔄 Reintentando chunk ${chunkIndex} (intento ${retryCount + 1}/${maxRetries})`)
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000)) // Exponential backoff
        return uploadChunk(chunk, chunkIndex, totalChunks, fileId, retryCount + 1)
      }
      throw error
    }
  }, [logger])

  // Upload principal con streaming
  const uploadFile = useCallback(async (file: File): Promise<StreamingResult> => {
    const validation = validateFile(file)
    if (!validation.valid) {
      throw new Error(validation.error)
    }

    setIsUploading(true)
    abortController.current = new AbortController()
    uploadedChunks.current.clear()

    const startTime = Date.now()
    const chunks = createChunks(file)
    const fileId = `upload_${Date.now()}_${Math.random().toString(36).substring(2)}`
    
    logger.info('📤 Iniciando upload con streaming', {
      fileName: file.name,
      fileSize: file.size,
      chunks: chunks.length,
      chunkSize
    })

    try {
      // Inicializar upload en el servidor
      const initResponse = await fetch('/api/init-upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileId,
          fileName: file.name,
          fileSize: file.size,
          totalChunks: chunks.length,
          fileType: file.type
        }),
        signal: abortController.current.signal
      })

      if (!initResponse.ok) {
        throw new Error('Failed to initialize upload')
      }

      // Upload chunks con progreso
      let uploadedBytes = 0
      const startIndex = pausedChunkIndex.current

      for (let i = startIndex; i < chunks.length; i++) {
        if (abortController.current?.signal.aborted) {
          throw new Error('Upload aborted')
        }

        if (isPaused) {
          pausedChunkIndex.current = i
          setIsUploading(false)
          return new Promise((resolve, reject) => {
            // Guardar estado para resumir
            const resumeData = { resolve, reject, fileId, chunks, file, uploadedBytes, startTime }
            // En implementación real, guardaríamos esto en localStorage o estado persistente
          }) as Promise<StreamingResult>
        }

        const chunk = chunks[i]
        await uploadChunk(chunk, i, chunks.length, fileId)
        
        uploadedBytes += chunk.size
        const elapsed = Date.now() - startTime
        const speed = uploadedBytes / (elapsed / 1000) // bytes per second
        const remaining = file.size - uploadedBytes
        const estimatedTime = remaining / speed

        // Actualizar progreso
        const currentProgress: UploadProgress = {
          loaded: uploadedBytes,
          total: file.size,
          percentage: Math.round((uploadedBytes / file.size) * 100),
          speed,
          estimatedTime,
          currentChunk: i + 1,
          totalChunks: chunks.length
        }

        setProgress(currentProgress)

        // Throttle progress updates
        if (i % Math.max(1, Math.floor(chunks.length / 100)) === 0) {
          await new Promise(resolve => setTimeout(resolve, progressInterval))
        }
      }

      // Finalizar upload
      const finalizeResponse = await fetch('/api/finalize-upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileId }),
        signal: abortController.current.signal
      })

      if (!finalizeResponse.ok) {
        throw new Error('Failed to finalize upload')
      }

      const result = await finalizeResponse.json()
      const totalTime = Date.now() - startTime

      const streamingResult: StreamingResult = {
        fileId: result.fileId,
        url: result.url,
        metadata: {
          size: file.size,
          type: file.type,
          name: file.name,
          chunks: chunks.length,
          uploadTime: totalTime
        }
      }

      logger.info('✅ Upload completado', {
        fileId,
        totalTime,
        averageSpeed: (file.size / (totalTime / 1000) / 1024 / 1024).toFixed(2) + ' MB/s'
      })

      return streamingResult

    } catch (error) {
      logger.error('❌ Error en upload:', error)
      throw error
    } finally {
      setIsUploading(false)
      setProgress(null)
      pausedChunkIndex.current = 0
      abortController.current = null
    }
  }, [validateFile, createChunks, uploadChunk, isPaused, progressInterval, logger])

  const pauseUpload = useCallback(() => {
    setIsPaused(true)
    logger.info('⏸️ Upload pausado')
  }, [logger])

  const resumeUpload = useCallback(() => {
    setIsPaused(false)
    logger.info('▶️ Upload reanudado')
    // En implementación real, reanudaríamos desde pausedChunkIndex
  }, [logger])

  const cancelUpload = useCallback(() => {
    if (abortController.current) {
      abortController.current.abort()
      logger.info('🛑 Upload cancelado')
    }
    setIsPaused(false)
    pausedChunkIndex.current = 0
    uploadedChunks.current.clear()
  }, [logger])

  return {
    uploadFile,
    isUploading,
    progress,
    isPaused,
    pauseUpload,
    resumeUpload,
    cancelUpload,
    validateFile
  }
}
