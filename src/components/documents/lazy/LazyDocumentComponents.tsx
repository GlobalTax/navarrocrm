
import { lazy, Suspense } from 'react'
import { DocumentGeneratorSkeleton } from './DocumentGeneratorSkeleton'
import { DocumentPreviewSkeleton } from './DocumentPreviewSkeleton'
import { DocumentAnalyzerSkeleton } from './DocumentAnalyzerSkeleton'
import { DocumentListSkeleton } from './DocumentListSkeleton'

// Lazy loaded components con preload strategies
export const LazyDocumentGenerator = lazy(() => 
  import('../DocumentGenerator').then(module => ({ default: module.DocumentGenerator }))
)

export const LazyDocumentPreview = lazy(() => 
  import('../generator/DocumentPreview').then(module => ({ default: module.DocumentPreview }))
)

export const LazyDocumentAnalyzer = lazy(() => 
  import('../../ai/DocumentAnalyzer').then(module => ({ default: module.DocumentAnalyzer }))
)

export const LazyTemplatePreview = lazy(() => 
  import('../TemplatePreviewDialog').then(module => ({ default: module.TemplatePreviewDialog }))
)

export const LazyGeneratedDocumentsList = lazy(() => 
  import('../GeneratedDocumentsList').then(module => ({ default: module.GeneratedDocumentsList }))
)

// HOCs con suspense y error boundaries optimizados
export const DocumentGeneratorWithSuspense = (props: any) => (
  <Suspense fallback={<DocumentGeneratorSkeleton />}>
    <LazyDocumentGenerator {...props} />
  </Suspense>
)

export const DocumentPreviewWithSuspense = (props: any) => (
  <Suspense fallback={<DocumentPreviewSkeleton />}>
    <LazyDocumentPreview {...props} />
  </Suspense>
)

export const DocumentAnalyzerWithSuspense = (props: any) => (
  <Suspense fallback={<DocumentAnalyzerSkeleton />}>
    <LazyDocumentAnalyzer {...props} />
  </Suspense>
)

// Preload utilities para componentes críticos
export const preloadDocumentComponents = () => {
  // Preload más utilizados
  LazyDocumentGenerator
  LazyDocumentPreview
}

// Batch preloader para optimización inicial
export const batchPreloadDocuments = async () => {
  const preloadPromises = [
    import('../DocumentGenerator'),
    import('../generator/DocumentPreview'),
    import('../../ai/DocumentAnalyzer')
  ]
  
  try {
    await Promise.allSettled(preloadPromises)
  } catch (error) {
    console.warn('Preload parcial de componentes de documentos:', error)
  }
}
