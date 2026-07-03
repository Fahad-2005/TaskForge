import React from 'react';

function HomeHub({ changeSubScreen, tasks = [] }) {
  const currentUser = JSON.parse(localStorage.getItem('user')) || { name: 'Fahad' };

  // Calculate high-level workspace stats dynamically
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'Complete').length;
  const inProgressTasks = tasks.filter(t => t.status === 'In Progress' || t.status === 'In Review').length;
  const urgentTasks = tasks.filter(t => t.priority === 'Urgent' && t.status !== 'Complete').length;

  // Percentage safe-division fallback
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div style={{ flex: 1, padding: '40px', backgroundColor: '#f8fafc', overflowY: 'auto', fontFamily: 'sans-serif' }}>
      
      {/* Welcome Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ margin: '0 0 8px 0', color: '#1e293b', fontSize: '28px', fontWeight: '800' }}>👋 Welcome back, {currentUser.name}!</h1>
        <p style={{ margin: 0, color: '#64748b', fontSize: '15px' }}>Here is a live look at your project status indicators across your active workspaces.</p>
      </div>

      {/* 📊 LIVE METRICS INSIGHTS GRID */}
      <div className="analytics-grid">
        <div className="stat-card" style={{ borderTop: '4px solid #4f46e5' }}>
          <p className="stat-label">Total Scope</p>
          <h2 className="stat-number">{totalTasks} Tasks</h2>
        </div>
        
        <div className="stat-card" style={{ borderTop: '4px solid #10b981' }}>
          <p className="stat-label">Completion Velocity</p>
          <h2 className="stat-number">{completionRate}%</h2>
        </div>

        <div className="stat-card" style={{ borderTop: '4px solid #f59e0b' }}>
          <p className="stat-label">In Pipeline</p>
          <h2 className="stat-number">{inProgressTasks} Active</h2>
        </div>

        <div className="stat-card" style={{ borderTop: '4px solid #ef4444' }}>
          <p className="stat-label">Urgent Bottlenecks</p>
          <h2 className="stat-number">{urgentTasks} Open</h2>
        </div>
      </div>

      {/* Navigation Router Action Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
        
        <div onClick={() => changeSubScreen('tasks')} style={{ background: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)', cursor: 'pointer', transition: 'transform 0.2s' }}>
          <div style={{ fontSize: '32px', marginBottom: '12px' }}>📋</div>
          <h3 style={{ margin: '0 0 8px 0', color: '#1e293b' }}>Active Task Board</h3>
          <p style={{ margin: 0, color: '#64748b', fontSize: '13px', lineHeight: '1.5' }}>Jump directly into your interactive Kanban column workflows and task assignments.</p>
        </div>

        <div onClick={() => changeSubScreen('settings')} style={{ background: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)', cursor: 'pointer', transition: 'transform 0.2s' }}>
          <div style={{ fontSize: '32px', marginBottom: '12px' }}>⚙️</div>
          <h3 style={{ margin: '0 0 8px 0', color: '#1e293b' }}>Account Profiles</h3>
          <p style={{ margin: 0, color: '#64748b', fontSize: '13px', lineHeight: '1.5' }}>Update your user profile configurations, visibility metrics, and team credentials.</p>
        </div>

      </div>
    </div>
  );
}

export default HomeHub;