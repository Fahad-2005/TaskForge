import React from 'react';
import './Sidebar.css';

function Sidebar({ onLogout, isOpen, currentScreen, onScreenChange }) {
  const currentUser = JSON.parse(localStorage.getItem('user')) || { name: 'Fahad' };

  return (
    <div className={`sidebar-container ${!isOpen ? 'sidebar-collapsed' : ''}`}>
      <div className="brand-header">
        <h2 className="brand-title">⚡ TaskForge</h2>
        <span style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '700' }}>Workspace Framework</span>
      </div>

      {/* Main Core Links Group */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
        
        <div 
          className="nav-item" 
          onClick={() => onScreenChange('home')}
          style={{ backgroundColor: currentScreen === 'home' ? '#2d3748' : 'transparent' }}
        >
          <span>🏠</span> Home Hub
        </div>

        <div 
          className="nav-item" 
          onClick={() => onScreenChange('tasks')}
          style={{ backgroundColor: currentScreen === 'tasks' ? '#2d3748' : 'transparent' }}
        >
          <span>📋</span> My Task Boards
        </div>

        <div 
          className="nav-item" 
          onClick={() => onScreenChange('settings')}
          style={{ backgroundColor: currentScreen === 'settings' ? '#2d3748' : 'transparent' }}
        >
          <span>⚙️</span> Settings
        </div>

      </div>

      <div className="sidebar-footer">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', paddingLeft: '8px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', color: '#fff' }}>
            {currentUser.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: '#f1f5f9' }}>{currentUser.name}</p>
            <p style={{ margin: 0, fontSize: '11px', color: '#64748b' }}>Owner</p>
          </div>
        </div>
        <button onClick={onLogout} className="logout-btn">Leave Workspace</button>
      </div>
    </div>
  );
}

export default Sidebar;