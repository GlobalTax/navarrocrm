import { useEffect, useCallback } from 'react'
import { useLogger } from '@/hooks/useLogger'

interface FontLoadOptions {
  families: string[]
  weights?: string[]
  styles?: string[]
  display?: 'auto' | 'block' | 'swap' | 'fallback' | 'optional'
  timeout?: number
}

interface CSSOptimizationOptions {
  enableCriticalCSS?: boolean
  enableAsyncLoading?: boolean
  enableMediaQueries?: boolean
  purgeUnusedCSS?: boolean
}

export function useFontAndCSSOptimization(
  fontOptions: FontLoadOptions,
  cssOptions: CSSOptimizationOptions = {}
) {
  const logger = useLogger('FontCSSOptimization')
  
  const {
    families = [],
    weights = ['400', '600'],
    styles = ['normal'],
    display = 'swap',
    timeout = 3000
  } = fontOptions

  const {
    enableCriticalCSS = true,
    enableAsyncLoading = true,
    enableMediaQueries = true,
    purgeUnusedCSS = false
  } = cssOptions

  // Optimize font loading with font-display and preload
  const optimizeFonts = useCallback(async () => {
    try {
      // Check if fonts are already loaded
      if ('fonts' in document) {
        const fontFaces = await Promise.allSettled(
          families.flatMap(family =>
            weights.flatMap(weight =>
              styles.map(style =>
                (document as any).fonts.load(`${weight} ${style} 16px ${family}`)
              )
            )
          )
        )

        const loadedCount = fontFaces.filter(f => f.status === 'fulfilled').length
        const totalFonts = fontFaces.length

        logger.info('🔤 Fuentes optimizadas', {
          loaded: loadedCount,
          total: totalFonts,
          loadRate: `${((loadedCount / totalFonts) * 100).toFixed(1)}%`
        })

        // Add font-display CSS if not present
        addFontDisplayCSS()
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Error de fuentes'
      logger.error('❌ Error optimizando fuentes', { error: errorMsg })
    }
  }, [families, weights, styles, logger])

  // Add font-display: swap to improve loading performance
  const addFontDisplayCSS = useCallback(() => {
    const existingStyle = document.getElementById('font-display-optimization')
    if (existingStyle) return

    const style = document.createElement('style')
    style.id = 'font-display-optimization'
    
    const fontFaceRules = families.map(family => `
      @font-face {
        font-family: '${family}';
        font-display: ${display};
      }
    `).join('\n')

    style.textContent = fontFaceRules
    document.head.appendChild(style)

    logger.info('💫 Font-display aplicado', { display, families: families.length })
  }, [families, display, logger])

  // Extract and inline critical CSS
  const optimizeCriticalCSS = useCallback(() => {
    if (!enableCriticalCSS) return

    try {
      // Get all stylesheets
      const stylesheets = Array.from(document.styleSheets)
      const criticalRules: string[] = []

      stylesheets.forEach(sheet => {
        try {
          const rules = Array.from(sheet.cssRules || [])
          
          rules.forEach(rule => {
            // Include critical rules (above-the-fold content)
            if (isCriticalRule(rule.cssText)) {
              criticalRules.push(rule.cssText)
            }
          })
        } catch (e) {
          // Cross-origin stylesheet, skip
        }
      })

      if (criticalRules.length > 0) {
        inlineCriticalCSS(criticalRules)
        
        logger.info('🎨 CSS crítico optimizado', {
          count: criticalRules.length,
          sizeInfo: `${(criticalRules.join('').length / 1024).toFixed(1)}KB`
        })
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Error CSS crítico'
      logger.error('❌ Error optimizando CSS crítico', { error: errorMsg })
    }
  }, [enableCriticalCSS, logger])

  // Load non-critical CSS asynchronously
  const loadAsyncCSS = useCallback((href: string, media = 'all') => {
    if (!enableAsyncLoading) return

    const link = document.createElement('link')
    link.rel = 'preload'
    link.as = 'style'
    link.href = href
    link.media = 'print'  // Load as print to avoid render blocking
    link.onload = function() {
      // @ts-ignore
      this.media = media
      // @ts-ignore
      this.onload = null
    }

    document.head.appendChild(link)

    // Fallback for browsers that don't support preload
    setTimeout(() => {
      if (link.media === 'print') {
        link.media = media
      }
    }, 100)

    logger.info('📄 CSS async cargado', { href: href.substring(0, 50), media })
  }, [enableAsyncLoading, logger])

  // Add media query optimizations
  const optimizeMediaQueries = useCallback(() => {
    if (!enableMediaQueries) return

    try {
      const links = document.querySelectorAll('link[rel="stylesheet"]')
      
      links.forEach((link: any) => {
        // Add appropriate media queries for responsive loading
        if (!link.media || link.media === 'all') {
          // Defer non-critical stylesheets
          if (link.href.includes('non-critical') || link.href.includes('print')) {
            link.media = 'print'
            link.onload = function() {
              this.media = 'all'
              this.onload = null
            }
          }
        }
      })

      logger.info('📱 Media queries optimizadas')
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Error media queries'
      logger.error('❌ Error optimizando media queries', { error: errorMsg })
    }
  }, [enableMediaQueries, logger])

  // Helper functions
  const isCriticalRule = (cssText: string): boolean => {
    // Define patterns for critical CSS (above-the-fold content)
    const criticalPatterns = [
      /body\s*{/, /html\s*{/, /\*\s*{/,  // Global styles
      /\.header/, /\.nav/, /\.hero/,     // Header/navigation
      /\.btn/, /\.button/,               // Buttons
      /\.container/, /\.wrapper/,        // Layout containers
      /@media.*max-width:\s*768px/       // Mobile-first critical
    ]

    return criticalPatterns.some(pattern => pattern.test(cssText))
  }

  const inlineCriticalCSS = (rules: string[]) => {
    const existingStyle = document.getElementById('critical-css-inline')
    if (existingStyle) return

    const style = document.createElement('style')
    style.id = 'critical-css-inline'
    style.textContent = rules.join('\n')
    
    // Insert at the beginning of head for highest priority
    document.head.insertBefore(style, document.head.firstChild)
  }

  // Run optimizations
  useEffect(() => {
    const runOptimizations = async () => {
      await optimizeFonts()
      optimizeCriticalCSS()
      optimizeMediaQueries()
    }

    // Delay to ensure DOM is ready
    const timer = setTimeout(runOptimizations, 100)
    return () => clearTimeout(timer)
  }, [optimizeFonts, optimizeCriticalCSS, optimizeMediaQueries])

  return {
    optimizeFonts,
    loadAsyncCSS,
    addFontDisplayCSS,
    optimizeCriticalCSS,
    optimizeMediaQueries
  }
}