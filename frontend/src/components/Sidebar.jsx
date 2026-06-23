import React from 'react';
import './Sidebar.css';

function Sidebar({ onLogout, isOpen }) {
  const currentUser = JSON.parse(localStorage.getItem('user')) || { name: 'Fahad' };

  return (
    <div className={`sidebar-container ${!isOpen ? 'sidebar-collapsed' : ''}`}>
      <div className="brand-header">
        <h2 className="brand-title">⚡ TaskForge</h2>
        <span style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '700' }}>ClickUp Workspace</span>
      </div>

      <div style={{ flex: 1 }}>
        <p style={{ fontSize: '12px', color: '#64748b', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.5px', marginBottom: '12px', paddingLeft: '8px' }}>Favorites</p>
        <div className="nav-item">
          <span>📁</span> Main Project Board
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