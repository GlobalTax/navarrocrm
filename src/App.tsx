import React from 'react'

// Brand new minimal component to break any caching
const MinimalApp = () => {
  console.log('🚀 MinimalApp starting...')
  
  return (
    <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ color: '#333', marginBottom: '20px' }}>
        🔧 Navarro CRM - React Recovery Mode
      </h1>
      
      <div style={{ 
        padding: '20px', 
        border: '2px solid #4CAF50', 
        borderRadius: '8px',
        backgroundColor: '#f0f8f0'
      }}>
        <h2>✅ React Status: Working</h2>
        <p>If you can see this message, React is functioning correctly.</p>
        <p><strong>Next step:</strong> We can now progressively add back the application features.</p>
      </div>
      
      <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#fff3cd', border: '1px solid #ffeaa7', borderRadius: '4px' }}>
        <strong>⚠️ Recovery Mode Active</strong><br/>
        This is a minimal React app to test basic functionality after fixing the hook corruption issue.
      </div>
    </div>
  )
}

export default MinimalApp