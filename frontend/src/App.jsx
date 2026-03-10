// src/App.jsx
function App() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* 1. Header*/}
      <header style={{
        height: '60px',
        backgroundColor: '#0ba83b',
        color: 'white',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0 20px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        zIndex: 10
      }}>
        <div style={{ width: '24px' }}></div>
        <h2 style={{ margin: 0, fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          Dublin Bikes
        </h2>
        <div style={{ cursor: 'pointer', fontSize: '1.5rem' }}>☰</div>
      </header>

      {/* 2. Body Container: station details */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* 2A. Left Sidebar*/}
        <aside style={{
          width: '320px',
          backgroundColor: 'white',
          boxShadow: '2px 0 5px rgba(0,0,0,0.05)',
          zIndex: 5,
          display: 'flex',
          flexDirection: 'column',
          padding: '20px'
        }}>
           <div style={{ border: '1px dashed #ccc', height: '100%', borderRadius: '8px', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#999', textAlign: 'center' }}>
             Sidebar Component<br/>(Now reaches the very bottom!)
           </div>
        </aside>

        {/* 2B. Right Content Area*/}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

          {/* Upper right area：Map area */}
          <main style={{ flex: 1, position: 'relative' }}>
            <div style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#888' }}>
              <h1>Map Component Goes Here</h1>
            </div>

            {/* Legend */}
            <div style={{ position: 'absolute', bottom: '20px', right: '20px', backgroundColor: 'white', padding: '10px 15px', borderRadius: '8px', boxShadow: '0 2px 6px rgba(0,0,0,0.2)' }}>
              <h4 style={{ margin: '0 0 10px 0', fontSize: '0.9rem' }}>Status</h4>
              <div style={{ fontSize: '0.8rem', lineHeight: '1.8' }}>
                <div>🟢 Available</div>
                <div>🟡 Low</div>
                <div>🔴 Empty</div>
              </div>
            </div>
          </main>

          {/* Bottom right area：weather */}
          <footer style={{
            height: '180px',
            backgroundColor: '#f8f9fa',
            borderTop: '1px solid #ddd',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 4
          }}>
            <div style={{ backgroundColor: '#fff3cd', color: '#856404', padding: '8px 20px', fontSize: '0.85rem' }}>
              ⚠️ Strong winds expected this evening (25-35 km/h)
            </div>
            <div style={{ flex: 1, padding: '15px 20px', display: 'flex', gap: '20px' }}>
               <div style={{ flex: 1, border: '1px dashed #ccc', borderRadius: '8px', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#999' }}>Weather Block 1</div>
               <div style={{ flex: 1, border: '1px dashed #ccc', borderRadius: '8px', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#999' }}>Weather Block 2</div>
               <div style={{ flex: 1, border: '1px dashed #ccc', borderRadius: '8px', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#999' }}>Weather Block 3</div>
            </div>
          </footer>

        </div>

      </div>

      {/* 3. Global Footer: Copyright and tools declaration */}
      <footer style={{
        height: '30px',
        backgroundColor: '#2c3e50',
        color: '#a0aabf',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        fontSize: '0.75rem',
        letterSpacing: '0.5px',
        zIndex: 10
      }}>
        <span>© 2026 Dublin Bikes Project Comp30830 Group1. Powered by React + Vite + Flask + MySQL.</span>
      </footer>
    </div>
  );
}

export default App;