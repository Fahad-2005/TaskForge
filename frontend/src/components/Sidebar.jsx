import { useState } from 'react';
import './Sidebar.css';

function Sidebar({ onLogout, isOpen, currentScreen, onScreenChange, workspaces, activeWorkspace, setActiveWorkspace, onCreateWorkspace, user }) {
  const currentUser = user || JSON.parse(localStorage.getItem('user')) || { name: 'Workspace User' };
  const [newSpaceName, setNewSpaceName] = useState('');
  const [showSpaceInput, setShowSpaceInput] = useState(false);

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
        <div className="brand-logo-row">
          <div className="brand-icon">⚡</div>
          <h2 className="brand-title">TaskForge</h2>
        </div>
        <span className="brand-tagline">Workspace Framework</span>
      </div>

      <div className="nav-section">
        <div
          className={`nav-item ${currentScreen === 'home' ? 'active' : ''}`}
          onClick={() => onScreenChange('home')}
        >
          <span className="nav-icon">🏠</span> Home Hub
        </div>
        <div
          className={`nav-item ${currentScreen === 'settings' ? 'active' : ''}`}
          onClick={() => onScreenChange('settings')}
        >
          <span className="nav-icon">⚙️</span> Settings
        </div>
      </div>

      <div className="workspace-scroll">
        <div>
          <div className="workspace-section-header">
            <span className="workspace-section-label">My Workspaces</span>
            <button type="button" className="add-space-btn" onClick={() => setShowSpaceInput(!showSpaceInput)}>+</button>
          </div>

          {showSpaceInput && (
            <form onSubmit={handleSpaceSubmit} className="space-input-form">
              <input
                type="text"
                className="space-input"
                placeholder="Workspace name..."
                value={newSpaceName}
                onChange={(e) => setNewSpaceName(e.target.value)}
                autoFocus
              />
            </form>
          )}

          <div className="workspace-list">
            {ownedSpaces.length === 0 ? (
              <span className="workspace-empty">No workspaces owned</span>
            ) : (
              ownedSpaces.map((space) => (
                <div
                  key={space._id}
                  className={`nav-item ${activeWorkspace?._id === space._id && currentScreen === 'tasks' ? 'active active-owned' : ''}`}
                  onClick={() => { setActiveWorkspace(space); onScreenChange('tasks'); }}
                  style={{ fontSize: '13px', padding: '8px 12px' }}
                >
                  <span className="nav-icon">👑</span> {space.name}
                </div>
              ))
            )}
          </div>
        </div>

        <div>
          <div className="workspace-section-header">
            <span className="workspace-section-label">Shared With Me</span>
          </div>

          <div className="workspace-list">
            {joinedSpaces.length === 0 ? (
              <span className="workspace-empty">No shared workspaces</span>
            ) : (
              joinedSpaces.map((space) => (
                <div
                  key={space._id}
                  className={`nav-item ${activeWorkspace?._id === space._id && currentScreen === 'tasks' ? 'active active-joined' : ''}`}
                  onClick={() => { setActiveWorkspace(space); onScreenChange('tasks'); }}
                  style={{ fontSize: '13px', padding: '8px 12px' }}
                >
                  <span className="nav-icon">🤝</span> {space.name}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="sidebar-footer">
        <div className="user-profile-row">
          <div className="user-avatar">
            {currentUser.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="user-name">{currentUser.name}</p>
            <p className="user-role">Owner</p>
          </div>
        </div>
        <button type="button" onClick={onLogout} className="logout-btn">Leave Workspace</button>
      </div>
    </div>
  );
}

export default Sidebar;
