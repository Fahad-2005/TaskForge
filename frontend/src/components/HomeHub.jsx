import React from 'react';
import './HomeHub.css';

function HomeHub({ changeSubScreen, tasks = [], user }) {
  const currentUser = user || JSON.parse(localStorage.getItem('user')) || { name: 'Fahad' };

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'Complete').length;
  const inProgressTasks = tasks.filter(t => t.status === 'In Progress' || t.status === 'In Review').length;
  const urgentTasks = tasks.filter(t => t.priority === 'Urgent' && t.status !== 'Complete').length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="home-hub main-content">
      <div className="page-scroll">
        <header className="page-header">
          <div className="welcome-badge">
            <span className="welcome-badge-dot" />
            Live workspace analytics
          </div>
          <h1 className="page-title">
            Welcome back, <span className="highlight">{currentUser.name}</span>
          </h1>
          <p className="page-subtitle">
            Here is a live look at your project status indicators across your active workspaces.
          </p>
        </header>

        <div className="analytics-grid">
          <div className="stat-card stat-card--scope">
            <div className="stat-card-header">
              <p className="stat-label">Total Scope</p>
              <div className="stat-icon stat-icon--scope">📊</div>
            </div>
            <h2 className="stat-number">{totalTasks} <span className="stat-unit">Tasks</span></h2>
          </div>

          <div className="stat-card stat-card--velocity">
            <div className="stat-card-header">
              <p className="stat-label">Completion Velocity</p>
              <div className="stat-icon stat-icon--velocity">🚀</div>
            </div>
            <h2 className="stat-number">{completionRate}<span className="stat-unit">%</span></h2>
          </div>

          <div className="stat-card stat-card--pipeline">
            <div className="stat-card-header">
              <p className="stat-label">In Pipeline</p>
              <div className="stat-icon stat-icon--pipeline">⚡</div>
            </div>
            <h2 className="stat-number">{inProgressTasks} <span className="stat-unit">Active</span></h2>
          </div>

          <div className="stat-card stat-card--urgent">
            <div className="stat-card-header">
              <p className="stat-label">Urgent Bottlenecks</p>
              <div className="stat-icon stat-icon--urgent">🔥</div>
            </div>
            <h2 className="stat-number">{urgentTasks} <span className="stat-unit">Open</span></h2>
          </div>
        </div>

        <p className="section-label">Quick Actions</p>
        <div className="action-grid">
          <div className="action-card" onClick={() => changeSubScreen('tasks')}>
            <div className="action-card-icon action-card-icon--board">📋</div>
            <h3 className="action-card-title">Active Task Board</h3>
            <p className="action-card-desc">
              Jump directly into your interactive Kanban column workflows and task assignments.
            </p>
            <span className="action-card-arrow">→</span>
          </div>

          <div className="action-card" onClick={() => changeSubScreen('settings')}>
            <div className="action-card-icon action-card-icon--settings">⚙️</div>
            <h3 className="action-card-title">Account Profiles</h3>
            <p className="action-card-desc">
              Update your user profile configurations, visibility metrics, and team credentials.
            </p>
            <span className="action-card-arrow">→</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomeHub;
