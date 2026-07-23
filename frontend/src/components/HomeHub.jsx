import { useMemo } from 'react';
import './HomeHub.css';

function getAssigneeId(task) {
  if (!task.assignedTo) return null;
  return typeof task.assignedTo === 'object' ? task.assignedTo._id : task.assignedTo;
}

function HomeHub({ changeSubScreen, tasks = [], user }) {
  const currentUser = user || JSON.parse(localStorage.getItem('user')) || { name: 'Fahad' };
  const currentUserId = String(currentUser.id || currentUser._id || '');

  const myTasks = useMemo(
    () => tasks.filter((task) => String(getAssigneeId(task) || '') === currentUserId),
    [tasks, currentUserId]
  );

  const totalTasks = myTasks.length;
  const completedTasks = myTasks.filter((t) => t.status === 'Complete').length;
  const inProgressTasks = myTasks.filter((t) => t.status === 'In Progress' || t.status === 'In Review').length;
  const urgentTasks = myTasks.filter((t) => t.priority === 'Urgent' && t.status !== 'Complete').length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const overdueTasks = myTasks.filter((t) => {
    if (!t.dueDate || t.status === 'Complete') return false;
    const due = new Date(t.dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return due < today;
  }).length;

  const statusBreakdown = [
    { label: 'To Do', value: myTasks.filter((t) => t.status === 'To Do').length, color: '#94a3b8' },
    { label: 'In Progress', value: myTasks.filter((t) => t.status === 'In Progress').length, color: '#6366f1' },
    { label: 'In Review', value: myTasks.filter((t) => t.status === 'In Review').length, color: '#f59e0b' },
    { label: 'Complete', value: completedTasks, color: '#10b981' },
  ];

  const maxStatusCount = Math.max(...statusBreakdown.map((item) => item.value), 1);

  return (
    <div className="home-hub main-content">
      <div className="page-scroll">
        <header className="page-header">
          <div className="welcome-badge">
            <span className="welcome-badge-dot" />
            Your personal workload
          </div>
          <h1 className="page-title">
            Welcome back, <span className="highlight">{currentUser.name}</span>
          </h1>
          <p className="page-subtitle">
            Track your assigned tasks, completion velocity, and overdue pressure across your workspaces.
          </p>
        </header>

        <div className="analytics-grid">
          <div className="stat-card stat-card--scope">
            <div className="stat-card-header">
              <p className="stat-label">My Tasks</p>
              <div className="stat-icon stat-icon--scope">📊</div>
            </div>
            <h2 className="stat-number">{totalTasks} <span className="stat-unit">Assigned</span></h2>
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
              <p className="stat-label">Overdue</p>
              <div className="stat-icon stat-icon--urgent">⏰</div>
            </div>
            <h2 className="stat-number">{overdueTasks} <span className="stat-unit">Late</span></h2>
          </div>
        </div>

        <p className="section-label">My Workload</p>
        <div className="workload-grid">
          <div className="workload-card">
            <div className="workload-card-header">
              <h3>My task status</h3>
              <span>{totalTasks} assigned</span>
            </div>
            {totalTasks === 0 ? (
              <p className="workload-empty">No tasks assigned to you yet.</p>
            ) : (
              <div className="workload-bars">
                {statusBreakdown.map((item) => (
                  <div className="workload-row" key={item.label}>
                    <div className="workload-row-meta">
                      <strong>{item.label}</strong>
                      <span>{item.value} task{item.value === 1 ? '' : 's'}</span>
                    </div>
                    <div className="workload-bar-track">
                      <div
                        className="workload-bar-fill"
                        style={{
                          width: `${Math.max(item.value ? 8 : 0, (item.value / maxStatusCount) * 100)}%`,
                          background: item.color,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="workload-card">
            <div className="workload-card-header">
              <h3>Completion rate</h3>
              <span>{completionRate}%</span>
            </div>
            <div className="completion-ring" style={{ '--completion': `${completionRate}%` }}>
              <div className="completion-ring-inner">
                <strong>{completionRate}%</strong>
                <span>complete</span>
              </div>
            </div>
            <div className="status-breakdown">
              {statusBreakdown.map((item) => (
                <div className="status-breakdown-item" key={item.label}>
                  <span className="status-dot" style={{ background: item.color }} />
                  <span>{item.label}</span>
                  <strong>{item.value}</strong>
                </div>
              ))}
            </div>
          </div>

          <div className="workload-card">
            <div className="workload-card-header">
              <h3>Overdue pressure</h3>
              <span>{overdueTasks} tasks</span>
            </div>
            <div className="overdue-meter">
              <div
                className="overdue-meter-fill"
                style={{ width: `${totalTasks ? Math.min(100, (overdueTasks / totalTasks) * 100) : 0}%` }}
              />
            </div>
            <p className="workload-note">
              {overdueTasks === 0
                ? 'No overdue tasks on your plate — deadlines are on track.'
                : `${overdueTasks} of your task${overdueTasks === 1 ? '' : 's'} ${overdueTasks === 1 ? 'is' : 'are'} past due${urgentTasks ? `, including ${urgentTasks} urgent` : ''}.`}
            </p>
            <button type="button" className="btn-primary workload-cta" onClick={() => changeSubScreen('my-tasks')}>
              Open My Tasks
            </button>
          </div>
        </div>

        <p className="section-label">Quick Actions</p>
        <div className="action-grid">
          <div className="action-card" onClick={() => changeSubScreen('tasks')}>
            <div className="action-card-icon action-card-icon--board">📋</div>
            <h3 className="action-card-title">Active Task Board</h3>
            <p className="action-card-desc">
              Jump into Kanban drag-and-drop workflows, calendar, and timeline views.
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
