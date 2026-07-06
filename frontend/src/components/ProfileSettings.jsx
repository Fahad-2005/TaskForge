import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import './ProfileSettings.css';

function ProfileSettings({ user, onUserUpdate }) {
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });
  const { theme, setTheme, isDark } = useTheme();

  const userId = user?.id || user?._id;

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
    }
  }, [user]);

  const handleSave = async () => {
    if (!userId) return;
    setStatusMessage({ type: '', text: '' });
    setIsSaving(true);

    try {
      const response = await fetch(`http://localhost:5000/api/auth/profile/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), email: email.trim() }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to update profile');

      localStorage.setItem('user', JSON.stringify(data.user));
      if (onUserUpdate) onUserUpdate(data.user);
      setStatusMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (error) {
      setStatusMessage({ type: 'error', text: error.message });
    } finally {
      setIsSaving(false);
    }
  };

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
              {(name || 'U').charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="settings-title">{name || 'User'}</h2>
              <p className="settings-desc">{email}</p>
            </div>
          </div>

          <hr className="settings-divider" />

          {statusMessage.text && (
            <div className={`settings-status settings-status--${statusMessage.type}`}>
              {statusMessage.text}
            </div>
          )}

          <div className="settings-form">
            <div className="form-field">
              <label htmlFor="profile-name">Full Name</label>
              <input
                id="profile-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="form-field">
              <label htmlFor="profile-email">Email Address</label>
              <input
                id="profile-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <button
              type="button"
              className="btn-primary settings-save-btn"
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
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
