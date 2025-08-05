// EMERGENCY BYPASS - Pure JavaScript test with maximum visibility
console.log('🚨 EMERGENCY_BYPASS: Loading emergency bypass system')
console.log('🚨 EMERGENCY_BYPASS: Timestamp 1754337298171')

// Phase 1: Verify basic loading
document.addEventListener('DOMContentLoaded', function() {
  console.log('🚨 EMERGENCY_BYPASS: DOM loaded successfully')
  
  // Add highly visible indicator to the page
  const root = document.getElementById('root')
  if (root) {
    console.log('🚨 EMERGENCY_BYPASS: Root found, clearing content')
    root.innerHTML = ''
    
    // Create highly visible test element
    const testElement = document.createElement('div')
    testElement.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: linear-gradient(45deg, #00ff00, #ffff00);
      color: #000;
      font-family: 'Courier New', monospace;
      font-size: 24px;
      font-weight: bold;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      z-index: 99999;
      text-align: center;
      padding: 20px;
      box-sizing: border-box;
    `
    
    testElement.innerHTML = `
      <div>🚨 EMERGENCY BYPASS ACTIVE 🚨</div>
      <div style="margin: 20px 0;">Timestamp: 1754337298171</div>
      <div style="margin: 20px 0;">✅ JavaScript Loading: SUCCESS</div>
      <div style="margin: 20px 0;">✅ DOM Manipulation: SUCCESS</div>
      <div style="margin: 20px 0;">✅ CSS Styling: SUCCESS</div>
      <div id="react-test" style="margin: 20px 0;">🔄 React Test: PENDING</div>
      <button id="test-btn" style="
        background: #ff0000;
        color: white;
        border: none;
        padding: 15px 30px;
        font-size: 18px;
        border-radius: 10px;
        cursor: pointer;
        margin: 20px;
      ">Test JavaScript Events</button>
    `
    
    root.appendChild(testElement)
    console.log('🚨 EMERGENCY_BYPASS: Visual indicator added')
    
    // Test JavaScript events
    const testBtn = document.getElementById('test-btn')
    if (testBtn) {
      testBtn.addEventListener('click', function() {
        console.log('🚨 EMERGENCY_BYPASS: Button click successful')
        testBtn.textContent = '✅ Events Work!'
        testBtn.style.background = '#00ff00'
        testBtn.style.color = '#000'
      })
    }
    
    // Phase 2: Test React loading
    setTimeout(() => {
      console.log('🚨 EMERGENCY_BYPASS: Starting React test phase')
      testReactLoading()
    }, 1000)
    
  } else {
    console.error('🚨 EMERGENCY_BYPASS: No root element found!')
  }
})

// Phase 2: Test React in complete isolation
function testReactLoading() {
  console.log('🚨 EMERGENCY_BYPASS: Testing React loading...')
  
  try {
    // Try to import React dynamically
    import('react').then(React => {
      console.log('🚨 EMERGENCY_BYPASS: React import successful:', !!React)
      console.log('🚨 EMERGENCY_BYPASS: React.useState available:', !!React.useState)
      
      const reactTestDiv = document.getElementById('react-test')
      if (reactTestDiv) {
        reactTestDiv.innerHTML = '✅ React Import: SUCCESS'
        reactTestDiv.style.color = '#00aa00'
      }
      
      // Try React DOM
      import('react-dom/client').then(ReactDOM => {
        console.log('🚨 EMERGENCY_BYPASS: ReactDOM import successful:', !!ReactDOM)
        console.log('🚨 EMERGENCY_BYPASS: createRoot available:', !!ReactDOM.createRoot)
        
        if (reactTestDiv) {
          reactTestDiv.innerHTML = '✅ React + ReactDOM: SUCCESS'
        }
        
        // If we get here, React is working - test actual component
        testReactComponent(React, ReactDOM)
        
      }).catch(error => {
        console.error('🚨 EMERGENCY_BYPASS: ReactDOM import failed:', error)
        const reactTestDiv = document.getElementById('react-test')
        if (reactTestDiv) {
          reactTestDiv.innerHTML = '❌ ReactDOM Import: FAILED'
          reactTestDiv.style.color = '#ff0000'
        }
      })
      
    }).catch(error => {
      console.error('🚨 EMERGENCY_BYPASS: React import failed:', error)
      const reactTestDiv = document.getElementById('react-test')
      if (reactTestDiv) {
        reactTestDiv.innerHTML = '❌ React Import: FAILED'
        reactTestDiv.style.color = '#ff0000'
      }
    })
  } catch (error) {
    console.error('🚨 EMERGENCY_BYPASS: React test setup failed:', error)
  }
}

// Phase 3: Test actual React component
function testReactComponent(React, ReactDOM) {
  console.log('🚨 EMERGENCY_BYPASS: Testing React component...')
  
  try {
    // Create a simple component using createElement (no JSX)
    const TestComponent = () => {
      console.log('🚨 EMERGENCY_BYPASS: TestComponent render called')
      
      try {
        const [count, setCount] = React.useState(0)
        console.log('🚨 EMERGENCY_BYPASS: useState working, count:', count)
        
        return React.createElement('div', {
          style: {
            background: '#0000ff',
            color: 'white',
            padding: '20px',
            margin: '20px',
            borderRadius: '10px',
            textAlign: 'center'
          }
        }, [
          React.createElement('div', { key: 'title' }, '✅ React Component Working!'),
          React.createElement('div', { key: 'count' }, `Count: ${count}`),
          React.createElement('button', {
            key: 'button',
            style: {
              background: 'white',
              color: 'blue',
              border: 'none',
              padding: '10px',
              margin: '10px',
              borderRadius: '5px',
              cursor: 'pointer'
            },
            onClick: () => {
              console.log('🚨 EMERGENCY_BYPASS: Button clicked, incrementing count')
              setCount(count + 1)
            }
          }, 'Increment')
        ])
      } catch (error) {
        console.error('🚨 EMERGENCY_BYPASS: useState failed:', error)
        return React.createElement('div', {
          style: { background: 'red', color: 'white', padding: '20px' }
        }, `❌ useState Error: ${error.message}`)
      }
    }
    
    // Create a container for React
    const reactContainer = document.createElement('div')
    document.getElementById('root').appendChild(reactContainer)
    
    // Try to render
    const root = ReactDOM.createRoot(reactContainer)
    root.render(React.createElement(TestComponent))
    
    console.log('🚨 EMERGENCY_BYPASS: React component render attempted')
    
    // Update status
    const reactTestDiv = document.getElementById('react-test')
    if (reactTestDiv) {
      reactTestDiv.innerHTML = '✅ React Component: RENDERED'
      reactTestDiv.style.color = '#0000ff'
    }
    
  } catch (error) {
    console.error('🚨 EMERGENCY_BYPASS: React component test failed:', error)
    const reactTestDiv = document.getElementById('react-test')
    if (reactTestDiv) {
      reactTestDiv.innerHTML = `❌ React Component: ${error.message}`
      reactTestDiv.style.color = '#ff0000'
    }
  }
}

console.log('🚨 EMERGENCY_BYPASS: Script loaded, waiting for DOM...')