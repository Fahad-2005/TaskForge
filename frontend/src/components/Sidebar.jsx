import React, { useState } from 'react';
import './Sidebar.css';

function Sidebar({ onLogout, isOpen, currentScreen, onScreenChange, workspaces, activeWorkspace, setActiveWorkspace, onCreateWorkspace }) {
  const currentUser = JSON.parse(localStorage.getItem('user')) || { name: 'Workspace User' };
  const [newSpaceName, setNewSpaceName] = useState('');
  const [showSpaceInput, setShowSpaceInput] = useState(false);

  // Destructure our new split array format with safety fallbacks
  const ownedSpaces = workspaces.owned || [];
  const joinedSpaces = workspaces.joined || [];

  const handleSpaceSubmit = (e) => {
    e.preventDefault();
    if (!newSpaceName.trim()) return;
    onCreateWorkspace(newSpaceName);
    setNewSpaceName('');
    setShowSpaceInput(false);
  };

  return (
    <div className={`sidebar-container ${!isOpen ? 'sidebar-collapsed' : ''}`}>
      <div className="brand-header">
        <h2 className="brand-title">⚡ TaskForge</h2>
        <span style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '700' }}>Workspace Framework</span>
      </div>

      {/* Main Core Links */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '24px' }}>
        <div className="nav-item" onClick={() => onScreenChange('home')} style={{ backgroundColor: currentScreen === 'home' ? '#2d3748' : 'transparent' }}>
          <span>🏠</span> Home Hub
        </div>
        <div className="nav-item" onClick={() => onScreenChange('settings')} style={{ backgroundColor: currentScreen === 'settings' ? '#2d3748' : 'transparent' }}>
          <span>⚙️</span> Settings
        </div>
      </div>

      {/* 📁 WORKSPACE MANAGEMENT INTERFACE */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto', gap: '20px' }}>
        
        {/* SECTION 1: OWNED WORKSPACES */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', padding: '0 8px' }}>
            <span style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.5px' }}>My Workspaces</span>
            <button onClick={() => setShowSpaceInput(!showSpaceInput)} style={{ background: 'none', border: 'none', color: '#fbbf24', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold' }}>+</button>
          </div>

          {showSpaceInput && (
            <form onSubmit={handleSpaceSubmit} style={{ padding: '0 8px', marginBottom: '12px' }}>
              <input type="text" placeholder="Workspace name..." value={newSpaceName} onChange={(e) => setNewSpaceName(e.target.value)} style={{ width: '100%', padding: '6px 10px', borderRadius: '4px', border: '1px solid #334155', backgroundColor: '#0f172a', color: '#fff', fontSize: '12px', boxSizing: 'border-box' }} autoFocus />
            </form>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {ownedSpaces.length === 0 ? (
              <span style={{ fontSize: '12px', color: '#475569', paddingLeft: '8px' }}>No workspaces owned</span>
            ) : (
              ownedSpaces.map((space) => (
                <div key={space._id} className="nav-item" onClick={() => { setActiveWorkspace(space); onScreenChange('tasks'); }} style={{ backgroundColor: activeWorkspace?._id === space._id && currentScreen === 'tasks' ? '#4f46e5' : 'transparent', fontSize: '13px', padding: '8px 12px' }}>
                  <span>👑</span> {space.name}
                </div>
              ))
            )}
          </div>
        </div>

        {/* SECTION 2: JOINED WORKSPACES */}
        <div>
          <div style={{ marginBottom: '8px', padding: '0 8px' }}>
            <span style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.5px' }}>Shared With Me</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {joinedSpaces.length === 0 ? (
              <span style={{ fontSize: '12px', color: '#475569', paddingLeft: '8px' }}>No shared workspaces</span>
            ) : (
              joinedSpaces.map((space) => (
                <div key={space._id} className="nav-item" onClick={() => { setActiveWorkspace(space); onScreenChange('tasks'); }} style={{ backgroundColor: activeWorkspace?._id === space._id && currentScreen === 'tasks' ? '#0fb9b1' : 'transparent', fontSize: '13px', padding: '8px 12px' }}>
                  <span>🤝</span> {space.name}
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* User Footer */}
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