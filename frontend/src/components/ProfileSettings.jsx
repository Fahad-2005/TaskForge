import React, { useState } from 'react';
import './ProfileSettings.css';

function ProfileSettings() {
  const currentUser = JSON.parse(localStorage.getItem('user')) || { name: 'Fahad', email: 'fahad@example.com' };
  const [name, setName] = useState(currentUser.name);

  return (
    <div className="settings-page main-content">
      <div className="page-scroll">
        <header className="page-header">
          <h1 className="page-title">Account Settings</h1>
          <p className="page-subtitle">Manage your personal TaskForge credentials and profile visibility.</p>
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
      </div>
    </div>
  );
}

export default ProfileSettings;
