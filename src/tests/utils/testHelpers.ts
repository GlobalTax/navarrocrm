
// Esperar a que un elemento aparezca en el DOM
export const waitForElement = async (selector: string, timeout = 5000): Promise<Element> => {
  return new Promise((resolve, reject) => {
    const element = document.querySelector(selector)
    if (element) {
      resolve(element)
      return
    }

    const observer = new MutationObserver(() => {
      const element = document.querySelector(selector)
      if (element) {
        observer.disconnect()
        resolve(element)
      }
    })

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    })

    // Timeout de seguridad
    setTimeout(() => {
      observer.disconnect()
      reject(new Error(`Element ${selector} not found within ${timeout}ms`))
    }, timeout)
  })
}

// Esperar a que una condición se cumpla
export const waitForCondition = async (
  condition: () => boolean,
  timeout = 5000,
  interval = 100
): Promise<void> => {
  const start = Date.now()
  
  while (Date.now() - start < timeout) {
    if (condition()) {
      return
    }
    await new Promise(resolve => setTimeout(resolve, interval))
  }
  
  throw new Error(`Condition not met within ${timeout}ms`)
}

// Simular delay para testing
export const delay = (ms: number): Promise<void> => 
  new Promise(resolve => setTimeout(resolve, ms))

// Helper para debug en tests
export const debugElement = (element: Element | null) => {
  if (element) {
    console.log('Element HTML:', element.outerHTML)
    console.log('Element text content:', element.textContent)
  } else {
    console.log('Element not found')
  }
}
