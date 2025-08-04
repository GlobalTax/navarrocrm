// CRITICAL RECOVERY TEST - Timestamped to bypass ALL caches
// Generated at: 1754335827103
import React from 'react'
import { createRoot } from 'react-dom/client'

// Ultra-minimal React test with timestamp isolation
const CriticalRecoveryTest = () => {
  const [message, setMessage] = React.useState('🚨 Critical Recovery Test Starting...')
  const [clicks, setClicks] = React.useState(0)

  React.useEffect(() => {
    console.log('🔧 CRITICAL RECOVERY: React core functional!')
    console.log('🔧 CRITICAL RECOVERY: React version:', React.version)
    console.log('🔧 CRITICAL RECOVERY: Timestamp:', 1754335827103)
    setMessage('✅ React hooks working in critical recovery mode!')
  }, [])

  const handleClick = () => {
    setClicks(prev => prev + 1)
    setMessage(`✅ Click test passed! Count: ${clicks + 1}`)
  }

  return React.createElement('div', {
    style: {
      padding: '40px',
      fontFamily: 'Arial, sans-serif',
      maxWidth: '900px',
      margin: '0 auto',
      backgroundColor: '#f8f9fa',
      minHeight: '100vh'
    }
  }, [
    React.createElement('div', {
      key: 'header',
      style: {
        background: 'linear-gradient(135deg, #dc3545, #c82333)',
        color: 'white',
        padding: '25px',
        borderRadius: '12px',
        marginBottom: '25px',
        boxShadow: '0 4px 15px rgba(220, 53, 69, 0.3)'
      }
    }, [
      React.createElement('h1', { 
        key: 'title',
        style: { 
          margin: '0 0 15px 0',
          fontSize: '28px',
          fontWeight: 'bold'
        }
      }, '🚨 CRITICAL RECOVERY MODE'),
      React.createElement('p', { 
        key: 'status',
        style: { 
          margin: 0,
          fontSize: '16px',
          opacity: 0.95
        }
      }, message),
      React.createElement('p', { 
        key: 'timestamp',
        style: { 
          margin: '10px 0 0 0',
          fontSize: '14px',
          opacity: 0.8
        }
      }, `Recovery ID: 1754335827103`)
    ]),
    
    React.createElement('div', {
      key: 'tests',
      style: {
        background: '#ffffff',
        border: '3px solid #dc3545',
        padding: '25px',
        borderRadius: '12px',
        marginBottom: '25px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
      }
    }, [
      React.createElement('h2', { 
        key: 'test-title',
        style: { 
          marginTop: 0,
          color: '#212529',
          fontSize: '22px'
        }
      }, 'React Core Functionality Test'),
      React.createElement('div', {
        key: 'info',
        style: { marginBottom: '20px' }
      }, [
        React.createElement('p', { key: 'version' }, `React Version: ${React.version}`),
        React.createElement('p', { key: 'node-env' }, `Environment: ${process.env.NODE_ENV || 'unknown'}`),
        React.createElement('p', { key: 'timestamp' }, `Test Timestamp: ${new Date().toISOString()}`),
        React.createElement('p', { key: 'counter' }, `Click Counter: ${clicks}`)
      ]),
      React.createElement('button', {
        key: 'test-button',
        onClick: handleClick,
        style: {
          background: 'linear-gradient(135deg, #007bff, #0056b3)',
          color: 'white',
          border: 'none',
          padding: '12px 24px',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '16px',
          fontWeight: '500',
          marginRight: '15px',
          boxShadow: '0 2px 8px rgba(0, 123, 255, 0.3)',
          transition: 'all 0.2s ease'
        },
        onMouseOver: function(e) {
          e.target.style.transform = 'translateY(-2px)'
          e.target.style.boxShadow = '0 4px 12px rgba(0, 123, 255, 0.4)'
        },
        onMouseOut: function(e) {
          e.target.style.transform = 'translateY(0)'
          e.target.style.boxShadow = '0 2px 8px rgba(0, 123, 255, 0.3)'
        }
      }, 'Test React State & Events'),
      React.createElement('button', {
        key: 'reset-button',
        onClick: () => {
          setClicks(0)
          setMessage('🔄 Counter reset - React state working perfectly!')
        },
        style: {
          background: 'linear-gradient(135deg, #28a745, #1e7e34)',
          color: 'white',
          border: 'none',
          padding: '12px 24px',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '16px',
          fontWeight: '500',
          boxShadow: '0 2px 8px rgba(40, 167, 69, 0.3)',
          transition: 'all 0.2s ease'
        },
        onMouseOver: function(e) {
          e.target.style.transform = 'translateY(-2px)'
          e.target.style.boxShadow = '0 4px 12px rgba(40, 167, 69, 0.4)'
        },
        onMouseOut: function(e) {
          e.target.style.transform = 'translateY(0)'
          e.target.style.boxShadow = '0 2px 8px rgba(40, 167, 69, 0.3)'
        }
      }, 'Reset Counter')
    ]),
    
    React.createElement('div', {
      key: 'status',
      style: {
        background: clicks > 0 ? '#d4edda' : '#fff3cd',
        border: `2px solid ${clicks > 0 ? '#c3e6cb' : '#ffeaa7'}`,
        padding: '20px',
        borderRadius: '8px',
        fontSize: '15px',
        lineHeight: '1.6'
      }
    }, [
      React.createElement('strong', { key: 'status-title' }, 
        clicks > 0 ? '✅ SUCCESS: ' : '⚠️ TESTING: '
      ),
      clicks > 0 
        ? 'React core functionality is WORKING! State management, effects, and event handlers are all functional. The issue was with cached providers/dependencies.'
        : 'This is testing React core without ANY external dependencies. If this interface works, the problem is in the application providers or routing system, not React itself.'
    ])
  ])
}

// Emergency bootstrap with full isolation
const RECOVERY_ID = `CRITICAL_RECOVERY_1754335827103`
console.log(`🚨 ${RECOVERY_ID}: Starting critical recovery test`)
console.log(`🚨 ${RECOVERY_ID}: Cache buster active`)

try {
  const rootElement = document.getElementById('root')
  if (!rootElement) {
    throw new Error('Root element not found')
  }

  // Completely clear any existing content
  rootElement.innerHTML = ''
  rootElement.className = ''
  
  // Create fresh React root
  const root = createRoot(rootElement)
  root.render(React.createElement(CriticalRecoveryTest))
  
  console.log(`✅ ${RECOVERY_ID}: Critical recovery mounted successfully`)
  console.log(`✅ ${RECOVERY_ID}: React version ${React.version} is functional`)
} catch (error) {
  console.error(`🚨 ${RECOVERY_ID}: Critical recovery failed:`, error)
  
  // Last resort - pure DOM fallback
  const rootElement = document.getElementById('root')
  if (rootElement) {
    rootElement.innerHTML = `
      <div style="padding: 50px; font-family: system-ui; color: #721c24; background: #f8d7da; border: 3px solid #f5c6cb; border-radius: 8px; margin: 20px; text-align: center;">
        <h1 style="color: #721c24; margin-bottom: 20px;">🚨 CRITICAL REACT SYSTEM FAILURE</h1>
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: left;">
          <p><strong>Recovery ID:</strong> ${RECOVERY_ID}</p>
          <p><strong>Error:</strong> ${error.message}</p>
          <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
          <p><strong>Location:</strong> ${window.location.href}</p>
        </div>
        <p style="margin-top: 30px; font-size: 18px; font-weight: bold;">
          React core is completely non-functional. This requires immediate system intervention.
        </p>
      </div>
    `
  }
}