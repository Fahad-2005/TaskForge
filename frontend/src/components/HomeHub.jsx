import React from 'react';

function HomeHub({ changeSubScreen }) {
  const currentUser = JSON.parse(localStorage.getItem('user')) || { name: 'Fahad' };

  return (
    <div style={{ flex: 1, padding: '40px', backgroundColor: '#f8fafc', overflowY: 'auto', fontFamily: 'sans-serif' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ margin: '0 0 8px 0', color: '#1e293b', fontSize: '28px', fontWeight: '800' }}>👋 Welcome back, {currentUser.name}!</h1>
        <p style={{ margin: 0, color: '#64748b', fontSize: '15px' }}>Track your workspace components or customize your collaborative spaces below.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
        
        {/* Card 1: Go to Task Boards */}
        <div onClick={() => changeSubScreen('tasks')} style={{ background: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)', cursor: 'pointer', transition: 'transform 0.2s' }}>
          <div style={{ fontSize: '32px', marginBottom: '12px' }}>📋</div>
          <h3 style={{ margin: '0 0 8px 0', color: '#1e293b' }}>Active Task Board</h3>
          <p style={{ margin: 0, color: '#64748b', fontSize: '13px', lineHex: '1.5' }}>Jump directly into your interactive Kanban column workflows and project status indicators.</p>
        </div>

        {/* Card 2: Go to Profile */}
        <div onClick={() => changeSubScreen('settings')} style={{ background: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)', cursor: 'pointer', transition: 'transform 0.2s' }}>
          <div style={{ fontSize: '32px', marginBottom: '12px' }}>⚙️</div>
          <h3 style={{ margin: '0 0 8px 0', color: '#1e293b' }}>Account Profiles</h3>
          <p style={{ margin: 0, color: '#64748b', fontSize: '13px', lineHex: '1.5' }}>Update your user profile configurations, visibility metrics, and team credentials.</p>
        </div>

      </div>
    </div>
  );
}

export default HomeHub;