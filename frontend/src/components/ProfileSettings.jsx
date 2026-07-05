import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import './ProfileSettings.css';

function ProfileSettings() {
  const currentUser = JSON.parse(localStorage.getItem('user')) || { name: 'Fahad', email: 'fahad@example.com' };
  const [name, setName] = useState(currentUser.name);
  const { theme, setTheme, isDark } = useTheme();

  return (
    <div className="settings-page main-content">
      <div className="page-scroll">
        <header className="page-header">
          <h1 className="page-title">Account Settings</h1>
          <p className="page-subtitle">Manage your personal TaskForge credentials, appearance, and profile visibility.</p>
        </header>

        <div className="settings-card">
          <div className="settings-card-header">
            <div className="settings-avatar-large">
              {name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="settings-title">{name}</h2>
              <p className="settings-desc">{currentUser.email}</p>
            </div>
          </div>

          <hr className="settings-divider" />

          <div className="settings-form">
            <div className="form-field">
              <label htmlFor="profile-name">Full Name</label>
              <input id="profile-name" type="text" value={name} onChange={(e) => setName(e.target.value)} />
            </div>

            <div className="form-field">
              <label htmlFor="profile-email">Email Address</label>
              <input id="profile-email" type="email" value={currentUser.email} disabled />
            </div>

            <button type="button" className="btn-primary settings-save-btn">
              Save Changes
            </button>
          </div>
        </div>

        <div className="settings-card settings-appearance-card">
          <h3 className="settings-section-title">Appearance</h3>
          <p className="settings-section-desc">Switch between light and dark themes across the entire workspace.</p>

          <div className="theme-toggle-row">
            <div className="theme-toggle-info">
              <span className="theme-toggle-icon">{isDark ? '🌙' : '☀️'}</span>
              <div>
                <p className="theme-toggle-label">Theme Mode</p>
                <p className="theme-toggle-value">{isDark ? 'Dark Slate' : 'Light'}</p>
              </div>
            </div>

            <div className="theme-switcher">
              <button
                type="button"
                className={`theme-option ${theme === 'light' ? 'active' : ''}`}
                onClick={() => setTheme('light')}
              >
                Light
              </button>
              <button
                type="button"
                className={`theme-option ${theme === 'dark' ? 'active' : ''}`}
                onClick={() => setTheme('dark')}
              >
                Dark
              </button>
            </div>
          </div>

          <label className="theme-switch" htmlFor="theme-toggle">
            <span className="theme-switch-text">Enable dark mode</span>
            <input
              id="theme-toggle"
              type="checkbox"
              checked={isDark}
              onChange={(e) => setTheme(e.target.checked ? 'dark' : 'light')}
            />
            <span className="theme-switch-slider" />
          </label>
        </div>
      </div>
    </div>
  );
}

export default ProfileSettings;
