import React, { useState } from 'react';

function App() {
  const [activeView, setActiveView] = useState('board'); // Toggles: 'board' or 'list'

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'Segoe UI, sans-serif', margin: 0, backgroundColor: '#f9fafb' }}>
      
      {/* 1. SIDEBAR (ClickUp Navigation Style) */}
      <div style={{ width: '250px', backgroundColor: '#1e222b', color: '#ecc94b', padding: '20px', display: 'flex', flexDirection: 'column' }}>
        <h2 style={{ color: '#fff', margin: '0 0 10px 0', fontSize: '22px' }}>⚡ TaskForge</h2>
        <span style={{ fontSize: '12px', color: '#a0aec0', marginBottom: '20px' }}>ClickUp Inspired Workspace</span>
        <hr style={{ borderColor: '#2d3748', width: '100%', marginBottom: '20px' }} />
        <p style={{ color: '#fff', fontWeight: 'bold', cursor: 'pointer' }}>📁 Main Space</p>
      </div>

      {/* 2. MAIN WORKSPACE CONTAINER */}
      <div style={{ flex: 1, padding: '30px', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
        
        {/* TOP BAR / VIEW SWITCHER */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              onClick={() => setActiveView('board')}
              style={{
                padding: '10px 20px', borderRadius: '6px', border: 'none', cursor: 'pointer',
                backgroundColor: activeView === 'board' ? '#4c51bf' : '#e2e8f0',
                color: activeView === 'board' ? '#fff' : '#4a5568', fontWeight: '600'
              }}
            >
              📋 Board View
            </button>
            <button 
              onClick={() => setActiveView('list')}
              style={{
                padding: '10px 20px', borderRadius: '6px', border: 'none', cursor: 'pointer',
                backgroundColor: activeView === 'list' ? '#4c51bf' : '#e2e8f0',
                color: activeView === 'list' ? '#fff' : '#4a5568', fontWeight: '600'
              }}
            >
              ☰ List View
            </button>
          </div>
          <button style={{ backgroundColor: '#48bb78', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '6px', fontWeight: '600', cursor: 'pointer' }}>
            + New Task
          </button>
        </div>

        {/* WORKSPACE VIEW CONTENT AREA */}
        <div style={{ flex: 1, background: '#fff', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', padding: '20px' }}>
          {activeView === 'board' ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#718096' }}>
              <h3>🔄 Kanban Columns Coming Up Next!</h3>
              <p>This is where our draggable pipeline columns will live.</p>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px', color: '#718096' }}>
              <h3>📋 Compact Table List Row Components Coming Up Next!</h3>
              <p>This is where our tabular grid rows will live.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default App;