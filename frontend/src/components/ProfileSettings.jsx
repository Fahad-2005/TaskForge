import React, { useState } from 'react';

function ProfileSettings() {
  const currentUser = JSON.parse(localStorage.getItem('user')) || { name: 'Fahad', email: 'fahad@example.com' };
  const [name, setName] = useState(currentUser.name);

  return (
    <div style={{ flex: 1, padding: '40px', backgroundColor: '#f8fafc', overflowY: 'auto', fontFamily: 'sans-serif' }}>
      <div style={{ maxWidth: '600px', background: '#fff', padding: '32px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
        <h2 style={{ margin: '0 0 8px 0', color: '#1e293b', fontSize: '24px' }}>👤 Account Settings</h2>
        <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '24px' }}>Manage your personal TaskForge credentials and profile visibility.</p>
        <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', marginBottom: '24px' }} />

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '13px', fontWeight: '600', color: '#475569' }}>Full Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px' }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '13px', fontWeight: '600', color: '#475569' }}>Email Address</label>
            <input type="email" value={currentUser.email} disabled style={{ padding: '10px', borderRadius: '6px', border: '1px solid #e2e8f0', backgroundColor: '#f1f5f9', color: '#64748b', fontSize: '14px', cursor: 'not-allowed' }} />
          </div>

          <button style={{ backgroundColor: '#4f46e5', color: '#fff', border: 'none', padding: '12px', borderRadius: '6px', fontWeight: '600', fontSize: '14px', cursor: 'pointer', alignSelf: 'flex-start', marginTop: '10px' }}>
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProfileSettings;