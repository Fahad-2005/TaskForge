import { useMemo, useState } from 'react';
import TaskActivityDrawer from './TaskActivityDrawer';
import './MyTasks.css';

function getAssigneeId(task) {
  if (!task.assignedTo) return null;
  return typeof task.assignedTo === 'object' ? task.assignedTo._id : task.assignedTo;
}

function getWorkspaceId(task) {
  return typeof task.workspace === 'object' ? task.workspace?._id : task.workspace;
}

function MyTasks({ tasks = [], user, workspaces = { owned: [], joined: [] }, onOpenInWorkspace }) {
  const currentUser = user || JSON.parse(localStorage.getItem('user')) || {};
  const currentUserId = String(currentUser.id || currentUser._id || '');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [selectedTask, setSelectedTask] = useState(null);

  const workspaceMap = useMemo(() => {
    const map = new Map();
    [...(workspaces.owned || []), ...(workspaces.joined || [])].forEach((space) => {
      map.set(String(space._id), space);
    });
    return map;
  }, [workspaces]);

  const myTasks = useMemo(() => {
    return tasks
      .filter((task) => String(getAssigneeId(task) || '') === currentUserId)
      .filter((task) => statusFilter === 'All' || task.status === statusFilter)
      .filter((task) => priorityFilter === 'All' || task.priority === priorityFilter)
      .sort((a, b) => {
        const aDue = a.dueDate ? new Date(a.dueDate).getTime() : Number.MAX_SAFE_INTEGER;
        const bDue = b.dueDate ? new Date(b.dueDate).getTime() : Number.MAX_SAFE_INTEGER;
        return aDue - bDue;
      });
  }, [tasks, currentUserId, statusFilter, priorityFilter]);

  const openCount = myTasks.filter((task) => task.status !== 'Complete').length;
  const overdueCount = myTasks.filter((task) => {
    if (!task.dueDate || task.status === 'Complete') return false;
    const due = new Date(task.dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return due < today;
  }).length;

  const resolveMembers = (task) => {
    const workspace = workspaceMap.get(String(getWorkspaceId(task)));
    return workspace?.members || [];
  };

  return (
    <div className="my-tasks-page main-content">
      <div className="page-scroll">
        <header className="page-header">
          <div className="welcome-badge">
            <span className="welcome-badge-dot" />
            Personal inbox
          </div>
          <h1 className="page-title">My Tasks</h1>
          <p className="page-subtitle">
            Everything assigned to you across all workspaces, in one place.
          </p>
        </header>

        <div className="my-tasks-summary">
          <div className="my-tasks-stat">
            <span>Assigned</span>
            <strong>{myTasks.length}</strong>
          </div>
          <div className="my-tasks-stat">
            <span>Open</span>
            <strong>{openCount}</strong>
          </div>
          <div className="my-tasks-stat">
            <span>Overdue</span>
            <strong>{overdueCount}</strong>
          </div>
        </div>

        <div className="my-tasks-filters">
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="All">All Statuses</option>
            <option value="To Do">To Do</option>
            <option value="In Progress">In Progress</option>
            <option value="In Review">In Review</option>
            <option value="Complete">Complete</option>
          </select>
          <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
            <option value="All">All Priorities</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Urgent">Urgent</option>
          </select>
        </div>

        {myTasks.length === 0 ? (
          <div className="my-tasks-empty">
            <div className="empty-state-icon">✅</div>
            <h3>No assigned tasks</h3>
            <p>Tasks assigned to you will show up here automatically.</p>
          </div>
        ) : (
          <div className="my-tasks-list">
            {myTasks.map((task) => {
              const workspace = workspaceMap.get(String(getWorkspaceId(task)));
              const isOverdue = task.dueDate && task.status !== 'Complete' && new Date(task.dueDate) < new Date(new Date().setHours(0, 0, 0, 0));

              return (
                <article key={task._id} className="my-task-card">
                  <button type="button" className="my-task-main" onClick={() => setSelectedTask(task)}>
                    <div className="my-task-top">
                      <span className={`badge badge-${task.priority.toLowerCase()}`}>{task.priority}</span>
                      <span className="my-task-status">{task.status}</span>
                    </div>
                    <h3>{task.title}</h3>
                    <p>{task.description || 'No description provided.'}</p>
                    <div className="my-task-meta">
                      <span>{workspace?.name || 'Workspace'}</span>
                      <span className={isOverdue ? 'is-overdue' : ''}>
                        {task.dueDate
                          ? `Due ${new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`
                          : 'No due date'}
                      </span>
                    </div>
                  </button>
                  <div className="my-task-actions">
                    <button type="button" onClick={() => setSelectedTask(task)}>Discuss</button>
                    {workspace && (
                      <button
                        type="button"
                        onClick={() => onOpenInWorkspace?.(workspace, task._id)}
                      >
                        Open board
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      {selectedTask && (
        <TaskActivityDrawer
          task={selectedTask}
          workspaceId={getWorkspaceId(selectedTask)}
          members={resolveMembers(selectedTask)}
          onClose={() => setSelectedTask(null)}
          onEdit={() => {
            const workspace = workspaceMap.get(String(getWorkspaceId(selectedTask)));
            if (workspace) onOpenInWorkspace?.(workspace, selectedTask._id);
          }}
        />
      )}
    </div>
  );
}

export default MyTasks;
